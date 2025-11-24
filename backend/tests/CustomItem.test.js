import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import CustomItem from "../api/models/CustomItem.js";
import User from "../api/models/User.js";
import MenuItem from "../api/models/MenuItem.js";
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

describe("CustomItem Model", () => {
	let testUser;
	let testMenuItem;
	let testIngredient;

	beforeEach(async () => {
		await CustomItem.deleteMany();
		await User.deleteMany();
		await MenuItem.deleteMany();
		await Ingredient.deleteMany();

		// Create test user
		testUser = await User.create({
			name: "Test User",
			email: "test@example.com",
			password: "password123",
		});

		// Create test menu item
		testMenuItem = await MenuItem.create({
			name: "Base Coffee",
			price: 3.0,
			category: "Coffee",
		});

		// Create test ingredient
		testIngredient = await Ingredient.create({
			name: "Vanilla Syrup",
			price: 0.5,
			category: "flavoring",
		});
	});

	it("should create a custom item with required fields", async () => {
		const customItem = await CustomItem.create({
			user: testUser._id,
			name: "My Custom Coffee",
			baseItem: testMenuItem._id,
			ingredients: [testIngredient._id],
			dietaryRestrictions: ["vegan"],
			totalPrice: 3.5,
		});

		expect(customItem._id).toBeDefined();
		expect(customItem.name).toBe("My Custom Coffee");
		expect(customItem.user.toString()).toBe(testUser._id.toString());
		expect(customItem.baseItem.toString()).toBe(testMenuItem._id.toString());
		expect(customItem.ingredients.length).toBe(1);
		expect(customItem.dietaryRestrictions).toEqual(["vegan"]);
		expect(customItem.totalPrice).toBe(3.5);
		expect(customItem.savedAt).toBeDefined();
	});

	it("should allow null baseItem (start from scratch)", async () => {
		const customItem = await CustomItem.create({
			user: testUser._id,
			name: "From Scratch",
			baseItem: null,
			ingredients: [testIngredient._id],
			totalPrice: 0.5,
		});

		expect(customItem.baseItem).toBeNull();
		expect(customItem.ingredients.length).toBe(1);
	});

	it("should fail validation if user is missing", async () => {
		const invalidCustomItem = new CustomItem({
			name: "Invalid Item",
			ingredients: [testIngredient._id],
			totalPrice: 1.0,
		});
		await expect(invalidCustomItem.validate()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});

	it("should fail validation if name is missing", async () => {
		const invalidCustomItem = new CustomItem({
			user: testUser._id,
			ingredients: [testIngredient._id],
			totalPrice: 1.0,
		});
		await expect(invalidCustomItem.validate()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});

	it("should fail validation if totalPrice is missing", async () => {
		const invalidCustomItem = new CustomItem({
			user: testUser._id,
			name: "Test Item",
			ingredients: [testIngredient._id],
		});
		await expect(invalidCustomItem.validate()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});

	it("should accept empty dietaryRestrictions array", async () => {
		const customItem = await CustomItem.create({
			user: testUser._id,
			name: "No Restrictions",
			ingredients: [testIngredient._id],
			dietaryRestrictions: [],
			totalPrice: 0.5,
		});
		expect(customItem.dietaryRestrictions).toEqual([]);
	});

	it("should accept multiple ingredients", async () => {
		const ingredient2 = await Ingredient.create({
			name: "Caramel Syrup",
			price: 0.5,
			category: "flavoring",
		});

		const customItem = await CustomItem.create({
			user: testUser._id,
			name: "Multi Ingredient",
			ingredients: [testIngredient._id, ingredient2._id],
			totalPrice: 1.0,
		});

		expect(customItem.ingredients.length).toBe(2);
	});

	it("should accept multiple dietary restrictions", async () => {
		const customItem = await CustomItem.create({
			user: testUser._id,
			name: "Multiple Restrictions",
			ingredients: [testIngredient._id],
			dietaryRestrictions: ["vegan", "gluten-free", "nut-free"],
			totalPrice: 0.5,
		});

		expect(customItem.dietaryRestrictions).toEqual([
			"vegan",
			"gluten-free",
			"nut-free",
		]);
	});

	it("should fail validation for invalid dietary restriction", async () => {
		const invalidCustomItem = new CustomItem({
			user: testUser._id,
			name: "Invalid Restriction",
			ingredients: [testIngredient._id],
			dietaryRestrictions: ["invalid_restriction"],
			totalPrice: 0.5,
		});
		await expect(invalidCustomItem.validate()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});

	it("should store timestamps automatically", async () => {
		const customItem = await CustomItem.create({
			user: testUser._id,
			name: "Timestamped Item",
			ingredients: [testIngredient._id],
			totalPrice: 0.5,
		});
		expect(customItem.createdAt).toBeDefined();
		expect(customItem.updatedAt).toBeDefined();
		expect(customItem.savedAt).toBeDefined();
	});

	it("should populate user, baseItem, and ingredients", async () => {
		const customItem = await CustomItem.create({
			user: testUser._id,
			name: "Populated Item",
			baseItem: testMenuItem._id,
			ingredients: [testIngredient._id],
			totalPrice: 3.5,
		});

		const populated = await CustomItem.findById(customItem._id)
			.populate("user")
			.populate("baseItem")
			.populate("ingredients");

		expect(populated.user.email).toBe("test@example.com");
		expect(populated.baseItem.name).toBe("Base Coffee");
		expect(populated.ingredients[0].name).toBe("Vanilla Syrup");
	});
});
