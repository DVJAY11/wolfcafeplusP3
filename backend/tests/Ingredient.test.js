import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Ingredient from "../api/models/Ingredient.js";

let mongoServer;

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	const uri = mongoServer.getUri();
	await mongoose.connect(uri);
}, 30000);

afterAll(async () => {
	await mongoose.connection.close();
	await mongoServer.stop();
});

describe("Ingredient Model", () => {
	beforeEach(async () => {
		await Ingredient.deleteMany();
	});

	it("should create an ingredient with required fields", async () => {
		const ingredient = await Ingredient.create({
			name: "Almond Milk",
			price: 0.75,
			category: "dairy",
			allergens: ["nuts"],
			dietaryTags: ["vegan", "dairy-free"],
		});

		expect(ingredient._id).toBeDefined();
		expect(ingredient.name).toBe("Almond Milk");
		expect(ingredient.price).toBe(0.75);
		expect(ingredient.category).toBe("dairy");
		expect(ingredient.allergens).toEqual(["nuts"]);
		expect(ingredient.dietaryTags).toEqual(["vegan", "dairy-free"]);
		expect(ingredient.available).toBe(true); // default value
	});

	it("should set `available` to true by default", async () => {
		const ingredient = await Ingredient.create({
			name: "Vanilla Syrup",
			price: 0.5,
			category: "flavoring",
		});
		expect(ingredient.available).toBe(true);
	});

	it("should fail validation if name is missing", async () => {
		const invalidIngredient = new Ingredient({
			price: 0.5,
			category: "topping",
		});
		await expect(invalidIngredient.validate()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});

	it("should fail validation if price is missing", async () => {
		const invalidIngredient = new Ingredient({
			name: "Chocolate Chips",
			category: "topping",
		});
		await expect(invalidIngredient.validate()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});

	it("should fail validation if category is missing", async () => {
		const invalidIngredient = new Ingredient({
			name: "Honey",
			price: 0.5,
		});
		await expect(invalidIngredient.validate()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});

	it("should fail validation for invalid category", async () => {
		const invalidIngredient = new Ingredient({
			name: "Test",
			price: 1.0,
			category: "invalid_category",
		});
		await expect(invalidIngredient.validate()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});

	it("should accept valid allergens", async () => {
		const ingredient = await Ingredient.create({
			name: "Whole Milk",
			price: 0.5,
			category: "dairy",
			allergens: ["dairy"],
		});
		expect(ingredient.allergens).toEqual(["dairy"]);
	});

	it("should accept valid dietary tags", async () => {
		const ingredient = await Ingredient.create({
			name: "Lettuce",
			price: 0.5,
			category: "vegetable",
			dietaryTags: ["vegan", "gluten-free", "keto"],
		});
		expect(ingredient.dietaryTags).toEqual(["vegan", "gluten-free", "keto"]);
	});

	it("should fail validation for invalid allergen", async () => {
		const invalidIngredient = new Ingredient({
			name: "Test",
			price: 1.0,
			category: "topping",
			allergens: ["invalid_allergen"],
		});
		await expect(invalidIngredient.validate()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});

	it("should fail validation for invalid dietary tag", async () => {
		const invalidIngredient = new Ingredient({
			name: "Test",
			price: 1.0,
			category: "topping",
			dietaryTags: ["invalid_tag"],
		});
		await expect(invalidIngredient.validate()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});

	it("should store timestamps automatically", async () => {
		const ingredient = await Ingredient.create({
			name: "Espresso Shot",
			price: 1.5,
			category: "base",
		});
		expect(ingredient.createdAt).toBeDefined();
		expect(ingredient.updatedAt).toBeDefined();
	});

	it("should allow empty allergens and dietaryTags arrays", async () => {
		const ingredient = await Ingredient.create({
			name: "Water",
			price: 0,
			category: "other",
			allergens: [],
			dietaryTags: [],
		});
		expect(ingredient.allergens).toEqual([]);
		expect(ingredient.dietaryTags).toEqual([]);
	});

	it("should accept image URL", async () => {
		const ingredient = await Ingredient.create({
			name: "Avocado",
			price: 1.5,
			category: "vegetable",
			image: "https://example.com/avocado.jpg",
		});
		expect(ingredient.image).toBe("https://example.com/avocado.jpg");
	});
});
