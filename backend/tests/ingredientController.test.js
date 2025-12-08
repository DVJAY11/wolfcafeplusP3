import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
	getIngredients,
	addIngredient,
	validateCustomItem,
	updateIngredient,
	deleteIngredient,
} from "../api/controllers/ingredientController.js";
import Ingredient from "../api/models/Ingredient.js";
import MenuItem from "../api/models/MenuItem.js";

let mongoServer;

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	await mongoose.connect(mongoServer.getUri(), { dbName: "testDB" });
}, 30000);

afterAll(async () => {
	await mongoose.connection.close();
	await mongoServer.stop();
});

afterEach(async () => {
	await Ingredient.deleteMany({});
	await MenuItem.deleteMany({});
});

describe("🥗 Ingredient Controller", () => {
	const mockRes = () => {
		const res = {};
		res.status = jest.fn().mockReturnValue(res);
		res.json = jest.fn().mockReturnValue(res);
		return res;
	};

	describe("GET /api/ingredients → getIngredients()", () => {
		it("should return all ingredients", async () => {
			await Ingredient.create([
				{ name: "Almond Milk", price: 0.75, category: "dairy" },
				{ name: "Vanilla Syrup", price: 0.5, category: "flavoring" },
			]);

			const req = { query: {} };
			const res = mockRes();

			await getIngredients(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					message: "Ingredients fetched successfully",
					ingredients: expect.arrayContaining([
						expect.objectContaining({ name: "Almond Milk" }),
						expect.objectContaining({ name: "Vanilla Syrup" }),
					]),
				})
			);
		});

		it("should filter ingredients by category", async () => {
			await Ingredient.create([
				{ name: "Almond Milk", price: 0.75, category: "dairy" },
				{ name: "Vanilla Syrup", price: 0.5, category: "flavoring" },
			]);

			const req = { query: { category: "dairy" } };
			const res = mockRes();

			await getIngredients(req, res);

			const call = res.json.mock.calls[0][0];
			expect(call.ingredients.length).toBe(1);
			expect(call.ingredients[0].name).toBe("Almond Milk");
		});

		it("should filter ingredients by available status", async () => {
			await Ingredient.create([
				{ name: "Available", price: 0.5, category: "topping", available: true },
				{ name: "Unavailable", price: 0.5, category: "topping", available: false },
			]);

			const req = { query: { available: "true" } };
			const res = mockRes();

			await getIngredients(req, res);

			const call = res.json.mock.calls[0][0];
			expect(call.ingredients.length).toBe(1);
			expect(call.ingredients[0].name).toBe("Available");
		});
	});

	describe("POST /api/ingredients → addIngredient()", () => {
		it("should create a new ingredient", async () => {
			const req = {
				body: {
					name: "Chocolate Chips",
					price: 0.75,
					category: "topping",
					allergens: ["dairy"],
					dietaryTags: ["vegetarian"],
				},
			};
			const res = mockRes();

			await addIngredient(req, res);

			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					message: "Ingredient created successfully",
					ingredient: expect.objectContaining({
						name: "Chocolate Chips",
						price: 0.75,
					}),
				})
			);
		});

		it("should return 400 if name is missing", async () => {
			const req = { body: { price: 0.5, category: "topping" } };
			const res = mockRes();

			await addIngredient(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					message: "Name, price, and category are required",
				})
			);
		});

		it("should return 400 if price is missing", async () => {
			const req = { body: { name: "Test", category: "topping" } };
			const res = mockRes();

			await addIngredient(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
		});

		it("should return 400 if category is missing", async () => {
			const req = { body: { name: "Test", price: 0.5 } };
			const res = mockRes();

			await addIngredient(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
		});

		it("should return 400 if price is negative", async () => {
			const req = {
				body: { name: "Test", price: -1, category: "topping" },
			};
			const res = mockRes();

			await addIngredient(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					message: "Price cannot be negative",
				})
			);
		});
	});

	describe("PUT /api/ingredients/:id → updateIngredient()", () => {
		it("should update an ingredient", async () => {
			const ingredient = await Ingredient.create({
				name: "Old Name",
				price: 0.5,
				category: "topping",
			});

			const req = {
				params: { id: ingredient._id.toString() },
				body: { name: "New Name", price: 1.0 },
			};
			const res = mockRes();

			await updateIngredient(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					ingredient: expect.objectContaining({
						name: "New Name",
						price: 1.0,
					}),
				})
			);
		});

		it("should return 400 for invalid ID", async () => {
			const req = {
				params: { id: "invalid_id" },
				body: { name: "Test" },
			};
			const res = mockRes();

			await updateIngredient(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
		});

		it("should return 404 if ingredient not found", async () => {
			const req = {
				params: { id: new mongoose.Types.ObjectId().toString() },
				body: { name: "Test" },
			};
			const res = mockRes();

			await updateIngredient(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
		});
	});

	describe("DELETE /api/ingredients/:id → deleteIngredient()", () => {
		it("should delete an ingredient", async () => {
			const ingredient = await Ingredient.create({
				name: "To Delete",
				price: 0.5,
				category: "topping",
			});

			const req = { params: { id: ingredient._id.toString() } };
			const res = mockRes();

			await deleteIngredient(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					message: "Ingredient deleted successfully",
				})
			);

			const found = await Ingredient.findById(ingredient._id);
			expect(found).toBeNull();
		});

		it("should return 400 for invalid ID", async () => {
			const req = { params: { id: "invalid_id" } };
			const res = mockRes();

			await deleteIngredient(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
		});

		it("should return 404 if ingredient not found", async () => {
			const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
			const res = mockRes();

			await deleteIngredient(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
		});
	});

	describe("POST /api/ingredients/validate → validateCustomItem()", () => {
		it("should validate custom item and calculate price", async () => {
			const baseItem = await MenuItem.create({
				name: "Coffee",
				price: 3.0,
				available: true,
			});

			const ingredient = await Ingredient.create({
				name: "Vanilla Syrup",
				price: 0.5,
				category: "flavoring",
				available: true,
			});

			const req = {
				body: {
					baseItemId: baseItem._id.toString(),
					ingredientIds: [ingredient._id.toString()],
					dietaryRestrictions: [],
				},
			};
			const res = mockRes();

			await validateCustomItem(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					valid: true,
					totalPrice: 3.5,
					conflicts: [],
				})
			);
		});

		it("should detect dietary conflicts (vegan with dairy)", async () => {
			const ingredient = await Ingredient.create({
				name: "Whole Milk",
				price: 0.5,
				category: "dairy",
				allergens: ["dairy"],
				available: true,
			});

			const req = {
				body: {
					ingredientIds: [ingredient._id.toString()],
					dietaryRestrictions: ["vegan"],
				},
			};
			const res = mockRes();

			await validateCustomItem(req, res);

			const call = res.json.mock.calls[0][0];
			expect(call.valid).toBe(false);
			expect(call.conflicts.length).toBeGreaterThan(0);
			expect(call.conflicts[0]).toContain("animal products");
		});

		it("should detect gluten-free conflicts", async () => {
			const ingredient = await Ingredient.create({
				name: "Wheat Bread",
				price: 1.0,
				category: "bread",
				allergens: ["gluten"],
				available: true,
			});

			const req = {
				body: {
					ingredientIds: [ingredient._id.toString()],
					dietaryRestrictions: ["gluten-free"],
				},
			};
			const res = mockRes();

			await validateCustomItem(req, res);

			const call = res.json.mock.calls[0][0];
			expect(call.valid).toBe(false);
			expect(call.conflicts.length).toBeGreaterThan(0);
		});

		it("should return 400 if ingredientIds is missing", async () => {
			const req = { body: {} };
			const res = mockRes();

			await validateCustomItem(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
		});

		it("should return 404 if ingredient not found", async () => {
			const req = {
				body: {
					ingredientIds: [new mongoose.Types.ObjectId().toString()],
				},
			};
			const res = mockRes();

			await validateCustomItem(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
		});

		it("should detect unavailable ingredients", async () => {
			const ingredient = await Ingredient.create({
				name: "Unavailable Item",
				price: 0.5,
				category: "topping",
				available: false,
			});

			const req = {
				body: {
					ingredientIds: [ingredient._id.toString()],
				},
			};
			const res = mockRes();

			await validateCustomItem(req, res);

			const call = res.json.mock.calls[0][0];
			expect(call.conflicts.length).toBeGreaterThan(0);
			expect(call.conflicts[0]).toContain("unavailable");
		});

		// ==================== BUILD-YOUR-OWN SPECIFIC TESTS ====================
		it("BYO-1: should handle empty ingredientIds array (no ingredients)", async () => {
			const baseItem = await MenuItem.create({
				name: "Coffee",
				price: 3.0,
				available: true,
			});

			const req = {
				body: {
					baseItemId: baseItem._id.toString(),
					ingredientIds: [],
				},
			};
			const res = mockRes();

			await validateCustomItem(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			const result = res.json.mock.calls[0][0];
			expect(result.totalPrice).toBe(3.0); // Only base price
			expect(result.valid).toBe(true);
		});

		it("BYO-2: should return 400 for unavailable base item", async () => {
			const unavailableBase = await MenuItem.create({
				name: "Unavailable Coffee",
				price: 5.0,
				available: false,
			});

			const ingredient = await Ingredient.create({
				name: "Syrup",
				price: 0.5,
				category: "flavoring",
				available: true,
			});

			const req = {
				body: {
					baseItemId: unavailableBase._id.toString(),
					ingredientIds: [ingredient._id.toString()],
				},
			};
			const res = mockRes();

			await validateCustomItem(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					message: "Base item is not available",
				})
			);
		});

		it("BYO-3: should calculate price correctly with zero-price ingredients", async () => {
			const baseItem = await MenuItem.create({
				name: "Coffee",
				price: 3.0,
				available: true,
			});

			const freeIngredient = await Ingredient.create({
				name: "Free Sugar",
				price: 0,
				category: "other",
				available: true,
			});

			const req = {
				body: {
					baseItemId: baseItem._id.toString(),
					ingredientIds: [freeIngredient._id.toString()],
				},
			};
			const res = mockRes();

			await validateCustomItem(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			const result = res.json.mock.calls[0][0];
			expect(result.totalPrice).toBe(3.0); // Base price only
		});

		it("BYO-4: should store applicableFor field for section filtering", async () => {
			const drinkIngredient = await Ingredient.create({
				name: "Coffee Syrup",
				price: 0.5,
				category: "flavoring",
				available: true,
				applicableFor: ["drink"],
			});

			const mainIngredient = await Ingredient.create({
				name: "Cheese",
				price: 1.0,
				category: "dairy",
				available: true,
				applicableFor: ["main"],
			});

			// Query all ingredients
			const req = { query: {} };
			const res = mockRes();

			await getIngredients(req, res);

			const ingredients = res.json.mock.calls[0][0].ingredients;
			const drinkOnly = ingredients.filter(
				(i) => i.applicableFor && i.applicableFor.includes("drink")
			);
			const mainOnly = ingredients.filter(
				(i) => i.applicableFor && i.applicableFor.includes("main")
			);

			expect(drinkOnly.length).toBe(1);
			expect(drinkOnly[0].name).toBe("Coffee Syrup");
			expect(mainOnly.length).toBe(1);
			expect(mainOnly[0].name).toBe("Cheese");
		});

		it("BYO-5: should detect multiple dietary conflicts simultaneously", async () => {
			const conflictIngredient = await Ingredient.create({
				name: "Cheese Croissant",
				price: 2.0,
				category: "bread",
				available: true,
				allergens: ["dairy", "gluten"],
			});

			const req = {
				body: {
					ingredientIds: [conflictIngredient._id.toString()],
					dietaryRestrictions: ["vegan", "gluten-free"],
				},
			};
			const res = mockRes();

			await validateCustomItem(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			const result = res.json.mock.calls[0][0];
			expect(result.valid).toBe(false);
			expect(result.conflicts.length).toBeGreaterThanOrEqual(2);
			expect(result.conflicts.some(c => c.includes("vegan") || c.includes("animal"))).toBe(true);
			expect(result.conflicts.some(c => c.includes("gluten"))).toBe(true);
		});
	});
});
