import Ingredient from "../models/Ingredient.js";
import mongoose from "mongoose";

// GET /api/ingredients → list all available ingredients (grouped by category)
export const getIngredients = async (req, res) => {
	try {
		const { category, available } = req.query;

		const filter = {};
		if (category) filter.category = category;
		if (available !== undefined) filter.available = available === "true";

		const ingredients = await Ingredient.find(filter).sort({ category: 1, name: 1 });

		res.status(200).json({
			message: "Ingredients fetched successfully",
			ingredients,
		});
	} catch (err) {
		res.status(500).json({
			message: "Error fetching ingredients",
			error: err.message,
		});
	}
};

// POST /api/ingredients → add new ingredient (admin only)
export const addIngredient = async (req, res) => {
	try {
		const { name, price, category, allergens, dietaryTags, available, image } = req.body;

		if (!name || price === undefined || !category) {
			return res.status(400).json({
				message: "Name, price, and category are required",
			});
		}

		if (price < 0) {
			return res.status(400).json({
				message: "Price cannot be negative",
			});
		}

		const newIngredient = await Ingredient.create({
			name,
			price,
			category,
			allergens: allergens || [],
			dietaryTags: dietaryTags || [],
			available: available !== undefined ? available : true,
			image: image || "",
		});

		res.status(201).json({
			message: "Ingredient created successfully",
			ingredient: newIngredient,
		});
	} catch (err) {
		res.status(400).json({
			message: "Error creating ingredient",
			error: err.message,
		});
	}
};

// PUT /api/ingredients/:id → update ingredient (admin only)
export const updateIngredient = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid ingredient ID" });
		}

		const updatedIngredient = await Ingredient.findByIdAndUpdate(
			id,
			req.body,
			{ new: true, runValidators: true }
		);

		if (!updatedIngredient) {
			return res.status(404).json({ message: "Ingredient not found" });
		}

		res.status(200).json({
			message: "Ingredient updated successfully",
			ingredient: updatedIngredient,
		});
	} catch (err) {
		res.status(400).json({
			message: "Error updating ingredient",
			error: err.message,
		});
	}
};

// DELETE /api/ingredients/:id → delete ingredient (admin only)
export const deleteIngredient = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid ingredient ID" });
		}

		const deletedIngredient = await Ingredient.findByIdAndDelete(id);

		if (!deletedIngredient) {
			return res.status(404).json({ message: "Ingredient not found" });
		}

		res.status(200).json({
			message: "Ingredient deleted successfully",
			ingredient: deletedIngredient,
		});
	} catch (err) {
		res.status(500).json({
			message: "Error deleting ingredient",
			error: err.message,
		});
	}
};

// POST /api/ingredients/validate → validate custom item for dietary conflicts and calculate price
export const validateCustomItem = async (req, res) => {
	try {
		const { baseItemId, ingredientIds, dietaryRestrictions } = req.body;

		if (!ingredientIds || !Array.isArray(ingredientIds)) {
			return res.status(400).json({
				message: "ingredientIds array is required",
			});
		}

		let totalPrice = 0;
		const conflicts = [];
		const allergens = new Set();

		// Add base item price if provided
		if (baseItemId) {
			const MenuItem = (await import("../models/MenuItem.js")).default;
			const baseItem = await MenuItem.findById(baseItemId);
			if (!baseItem) {
				return res.status(404).json({ message: "Base item not found" });
			}
			if (!baseItem.available) {
				return res.status(400).json({ message: "Base item is not available" });
			}
			totalPrice += baseItem.price;
		}

		// Fetch all ingredients
		const ingredients = await Ingredient.find({
			_id: { $in: ingredientIds },
		});

		if (ingredients.length !== ingredientIds.length) {
			return res.status(404).json({
				message: "One or more ingredients not found",
			});
		}

		// Calculate price and check dietary conflicts
		for (const ingredient of ingredients) {
			if (!ingredient.available) {
				conflicts.push(`${ingredient.name} is currently unavailable`);
				continue;
			}

			totalPrice += ingredient.price;

			// Collect allergens
			if (ingredient.allergens) {
				ingredient.allergens.forEach((allergen) => allergens.add(allergen));
			}

			// Check dietary restrictions
			if (dietaryRestrictions && Array.isArray(dietaryRestrictions)) {
				for (const restriction of dietaryRestrictions) {
					// Check if ingredient is compatible with restriction
					const isCompatible = ingredient.dietaryTags?.includes(restriction);

					// Check for conflicts based on allergens and dietary restrictions
					if (restriction === "vegan" && ingredient.allergens?.some(a => ["dairy", "eggs"].includes(a))) {
						conflicts.push(`${ingredient.name} contains animal products (not vegan)`);
					}
					if (restriction === "vegetarian" && ingredient.category === "protein" && !ingredient.dietaryTags?.includes("vegetarian")) {
						conflicts.push(`${ingredient.name} may not be vegetarian`);
					}
					if (restriction === "gluten-free" && ingredient.allergens?.includes("gluten")) {
						conflicts.push(`${ingredient.name} contains gluten`);
					}
					if (restriction === "dairy-free" && ingredient.allergens?.includes("dairy")) {
						conflicts.push(`${ingredient.name} contains dairy`);
					}
					if (restriction === "nut-free" && ingredient.allergens?.includes("nuts")) {
						conflicts.push(`${ingredient.name} contains nuts`);
					}
				}
			}
		}

		res.status(200).json({
			message: conflicts.length > 0 ? "Validation completed with conflicts" : "Validation successful",
			valid: conflicts.length === 0,
			totalPrice: parseFloat(totalPrice.toFixed(2)),
			conflicts,
			allergens: Array.from(allergens),
		});
	} catch (err) {
		res.status(500).json({
			message: "Error validating custom item",
			error: err.message,
		});
	}
};
