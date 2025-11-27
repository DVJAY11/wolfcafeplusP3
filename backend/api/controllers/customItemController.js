import CustomItem from "../models/CustomItem.js";
import Ingredient from "../models/Ingredient.js";
import MenuItem from "../models/MenuItem.js";
import mongoose from "mongoose";

// POST /api/custom-items → save user's custom build
export const saveCustomItem = async (req, res) => {
	try {
		const userId = req.user._id;
		const { name, baseItem, ingredients, dietaryRestrictions, totalPrice } = req.body;

		if (!name) {
			return res.status(400).json({ message: "Name is required" });
		}

		if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
			return res.status(400).json({
				message: "At least one ingredient is required",
			});
		}

		if (totalPrice === undefined || totalPrice < 0) {
			return res.status(400).json({
				message: "Valid total price is required",
			});
		}

		// Validate base item if provided
		if (baseItem) {
			if (!mongoose.Types.ObjectId.isValid(baseItem)) {
				return res.status(400).json({ message: "Invalid base item ID" });
			}
			const baseMenuItem = await MenuItem.findById(baseItem);
			if (!baseMenuItem) {
				return res.status(404).json({ message: "Base item not found" });
			}
		}

		// Validate ingredients exist
		const validIngredients = await Ingredient.find({
			_id: { $in: ingredients },
		});

		if (validIngredients.length !== ingredients.length) {
			return res.status(404).json({
				message: "One or more ingredients not found",
			});
		}

		const newCustomItem = await CustomItem.create({
			user: userId,
			name,
			baseItem: baseItem || null,
			ingredients,
			dietaryRestrictions: dietaryRestrictions || [],
			totalPrice,
			savedAt: new Date(),
		});

		const populatedItem = await CustomItem.findById(newCustomItem._id)
			.populate("baseItem")
			.populate("ingredients");

		res.status(201).json({
			message: "Custom item saved successfully",
			customItem: populatedItem,
		});
	} catch (err) {
		res.status(500).json({
			message: "Error saving custom item",
			error: err.message,
		});
	}
};

// GET /api/custom-items → get user's saved custom items
export const getCustomItems = async (req, res) => {
	try {
		const userId = req.user._id;

		const customItems = await CustomItem.find({ user: userId })
			.populate("baseItem")
			.populate("ingredients")
			.sort({ savedAt: -1 });

		res.status(200).json({
			message: "Custom items fetched successfully",
			customItems,
		});
	} catch (err) {
		res.status(500).json({
			message: "Error fetching custom items",
			error: err.message,
		});
	}
};

// GET /api/custom-items/:id → get specific custom item
export const getCustomItemById = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid custom item ID" });
		}

		const customItem = await CustomItem.findOne({ _id: id, user: userId })
			.populate("baseItem")
			.populate("ingredients");

		if (!customItem) {
			return res.status(404).json({
				message: "Custom item not found or access denied",
			});
		}

		res.status(200).json({
			message: "Custom item fetched successfully",
			customItem,
		});
	} catch (err) {
		res.status(500).json({
			message: "Error fetching custom item",
			error: err.message,
		});
	}
};

// DELETE /api/custom-items/:id → delete saved custom item
export const deleteCustomItem = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid custom item ID" });
		}

		const deletedItem = await CustomItem.findOneAndDelete({
			_id: id,
			user: userId,
		});

		if (!deletedItem) {
			return res.status(404).json({
				message: "Custom item not found or access denied",
			});
		}

		res.status(200).json({
			message: "Custom item deleted successfully",
			customItem: deletedItem,
		});
	} catch (err) {
		res.status(500).json({
			message: "Error deleting custom item",
			error: err.message,
		});
	}
};

// PUT /api/custom-items/:id → update saved custom item
export const updateCustomItem = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id } = req.params;
		const { name, baseItem, ingredients, dietaryRestrictions, totalPrice } = req.body;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid custom item ID" });
		}

		// Validate base item if provided
		if (baseItem) {
			if (!mongoose.Types.ObjectId.isValid(baseItem)) {
				return res.status(400).json({ message: "Invalid base item ID" });
			}
			const baseMenuItem = await MenuItem.findById(baseItem);
			if (!baseMenuItem) {
				return res.status(404).json({ message: "Base item not found" });
			}
		}

		// Validate ingredients if provided
		if (ingredients && Array.isArray(ingredients)) {
			const validIngredients = await Ingredient.find({
				_id: { $in: ingredients },
			});
			if (validIngredients.length !== ingredients.length) {
				return res.status(404).json({
					message: "One or more ingredients not found",
				});
			}
		}

		const updatedItem = await CustomItem.findOneAndUpdate(
			{ _id: id, user: userId },
			{
				...(name && { name }),
				...(baseItem !== undefined && { baseItem: baseItem || null }),
				...(ingredients && { ingredients }),
				...(dietaryRestrictions && { dietaryRestrictions }),
				...(totalPrice !== undefined && { totalPrice }),
			},
			{ new: true, runValidators: true }
		)
			.populate("baseItem")
			.populate("ingredients");

		if (!updatedItem) {
			return res.status(404).json({
				message: "Custom item not found or access denied",
			});
		}

		res.status(200).json({
			message: "Custom item updated successfully",
			customItem: updatedItem,
		});
	} catch (err) {
		res.status(500).json({
			message: "Error updating custom item",
			error: err.message,
		});
	}
};
