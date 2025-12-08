import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
	saveCustomItem,
	getCustomItems,
	getCustomItemById,
	deleteCustomItem,
	updateCustomItem,
} from "../api/controllers/customItemController.js";
import CustomItem from "../api/models/CustomItem.js";
import User from "../api/models/User.js";
import MenuItem from "../api/models/MenuItem.js";
import Ingredient from "../api/models/Ingredient.js";

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
	await CustomItem.deleteMany({});
	await User.deleteMany({});
	await MenuItem.deleteMany({});
	await Ingredient.deleteMany({});
});

describe("🛠️ CustomItem Controller", () => {
	let testUser;
	let testMenuItem;
	let testIngredient;

	const mockRes = () => {
		const res = {};
		res.status = jest.fn().mockReturnValue(res);
		res.json = jest.fn().mockReturnValue(res);
		return res;
	};

	beforeEach(async () => {
		testUser = await User.create({
			name: "Test User",
			email: "test@example.com",
			password: "password123",
		});

		testMenuItem = await MenuItem.create({
			name: "Base Coffee",
			price: 3.0,
			category: "Coffee",
			available: true,
		});

		testIngredient = await Ingredient.create({
			name: "Vanilla Syrup",
			price: 0.5,
			category: "flavoring",
			available: true,
		});
	});

	describe("POST /api/custom-items → saveCustomItem()", () => {
		it("should save a new custom item", async () => {
			const req = {
				user: { _id: testUser._id },
				body: {
					name: "My Custom Coffee",
					baseItem: testMenuItem._id.toString(),
					ingredients: [testIngredient._id.toString()],
					dietaryRestrictions: ["vegan"],
					totalPrice: 3.5,
				},
			};
			const res = mockRes();

			await saveCustomItem(req, res);

			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					message: "Custom item saved successfully",
					customItem: expect.objectContaining({
						name: "My Custom Coffee",
					}),
				})
			);
		});

		it("should save custom item without base item", async () => {
			const req = {
				user: { _id: testUser._id },
				body: {
					name: "From Scratch",
					ingredients: [testIngredient._id.toString()],
					totalPrice: 0.5,
				},
			};
			const res = mockRes();

			await saveCustomItem(req, res);

			expect(res.status).toHaveBeenCalledWith(201);
			const call = res.json.mock.calls[0][0];
			expect(call.customItem.baseItem).toBeNull();
		});

		it("should return 400 if name is missing", async () => {
			const req = {
				user: { _id: testUser._id },
				body: {
					ingredients: [testIngredient._id.toString()],
					totalPrice: 0.5,
				},
			};
			const res = mockRes();

			await saveCustomItem(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					message: "Name is required",
				})
			);
		});

		it("should return 400 if ingredients array is empty", async () => {
			const req = {
				user: { _id: testUser._id },
				body: {
					name: "Test",
					ingredients: [],
					totalPrice: 0,
				},
			};
			const res = mockRes();

			await saveCustomItem(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					message: "At least one ingredient is required",
				})
			);
		});

		it("should return 400 if totalPrice is invalid", async () => {
			const req = {
				user: { _id: testUser._id },
				body: {
					name: "Test",
					ingredients: [testIngredient._id.toString()],
					totalPrice: -1,
				},
			};
			const res = mockRes();

			await saveCustomItem(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
		});

		it("should return 404 if base item not found", async () => {
			const req = {
				user: { _id: testUser._id },
				body: {
					name: "Test",
					baseItem: new mongoose.Types.ObjectId().toString(),
					ingredients: [testIngredient._id.toString()],
					totalPrice: 1.0,
				},
			};
			const res = mockRes();

			await saveCustomItem(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
		});

		it("should return 404 if ingredient not found", async () => {
			const req = {
				user: { _id: testUser._id },
				body: {
					name: "Test",
					ingredients: [new mongoose.Types.ObjectId().toString()],
					totalPrice: 1.0,
				},
			};
			const res = mockRes();

			await saveCustomItem(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
		});
	});

	describe("GET /api/custom-items → getCustomItems()", () => {
		it("should get all custom items for user", async () => {
			await CustomItem.create({
				user: testUser._id,
				name: "Item 1",
				ingredients: [testIngredient._id],
				totalPrice: 0.5,
			});

			await CustomItem.create({
				user: testUser._id,
				name: "Item 2",
				ingredients: [testIngredient._id],
				totalPrice: 1.0,
			});

			const req = { user: { _id: testUser._id } };
			const res = mockRes();

			await getCustomItems(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			const call = res.json.mock.calls[0][0];
			expect(call.customItems.length).toBe(2);
		});

		it("should return empty array if no custom items", async () => {
			const req = { user: { _id: testUser._id } };
			const res = mockRes();

			await getCustomItems(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			const call = res.json.mock.calls[0][0];
			expect(call.customItems).toEqual([]);
		});

		it("should only return items for the requesting user", async () => {
			const otherUser = await User.create({
				name: "Other User",
				email: "other@example.com",
				password: "password123",
			});

			await CustomItem.create({
				user: testUser._id,
				name: "User 1 Item",
				ingredients: [testIngredient._id],
				totalPrice: 0.5,
			});

			await CustomItem.create({
				user: otherUser._id,
				name: "User 2 Item",
				ingredients: [testIngredient._id],
				totalPrice: 0.5,
			});

			const req = { user: { _id: testUser._id } };
			const res = mockRes();

			await getCustomItems(req, res);

			const call = res.json.mock.calls[0][0];
			expect(call.customItems.length).toBe(1);
			expect(call.customItems[0].name).toBe("User 1 Item");
		});
	});

	describe("GET /api/custom-items/:id → getCustomItemById()", () => {
		it("should get custom item by ID", async () => {
			const customItem = await CustomItem.create({
				user: testUser._id,
				name: "Test Item",
				ingredients: [testIngredient._id],
				totalPrice: 0.5,
			});

			const req = {
				user: { _id: testUser._id },
				params: { id: customItem._id.toString() },
			};
			const res = mockRes();

			await getCustomItemById(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					customItem: expect.objectContaining({
						name: "Test Item",
					}),
				})
			);
		});

		it("should return 400 for invalid ID", async () => {
			const req = {
				user: { _id: testUser._id },
				params: { id: "invalid_id" },
			};
			const res = mockRes();

			await getCustomItemById(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
		});

		it("should return 404 if item not found or access denied", async () => {
			const otherUser = await User.create({
				name: "Other User",
				email: "other@example.com",
				password: "password123",
			});

			const customItem = await CustomItem.create({
				user: otherUser._id,
				name: "Other's Item",
				ingredients: [testIngredient._id],
				totalPrice: 0.5,
			});

			const req = {
				user: { _id: testUser._id },
				params: { id: customItem._id.toString() },
			};
			const res = mockRes();

			await getCustomItemById(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
		});
	});

	describe("DELETE /api/custom-items/:id → deleteCustomItem()", () => {
		it("should delete custom item", async () => {
			const customItem = await CustomItem.create({
				user: testUser._id,
				name: "To Delete",
				ingredients: [testIngredient._id],
				totalPrice: 0.5,
			});

			const req = {
				user: { _id: testUser._id },
				params: { id: customItem._id.toString() },
			};
			const res = mockRes();

			await deleteCustomItem(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					message: "Custom item deleted successfully",
				})
			);

			const found = await CustomItem.findById(customItem._id);
			expect(found).toBeNull();
		});

		it("should return 400 for invalid ID", async () => {
			const req = {
				user: { _id: testUser._id },
				params: { id: "invalid_id" },
			};
			const res = mockRes();

			await deleteCustomItem(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
		});

		it("should return 404 if trying to delete another user's item", async () => {
			const otherUser = await User.create({
				name: "Other User",
				email: "other@example.com",
				password: "password123",
			});

			const customItem = await CustomItem.create({
				user: otherUser._id,
				name: "Other's Item",
				ingredients: [testIngredient._id],
				totalPrice: 0.5,
			});

			const req = {
				user: { _id: testUser._id },
				params: { id: customItem._id.toString() },
			};
			const res = mockRes();

			await deleteCustomItem(req, res);

			expect(res.status).toHaveBeenCalledWith(404);

			// Item should still exist
			const found = await CustomItem.findById(customItem._id);
			expect(found).not.toBeNull();
		});
	});

	describe("PUT /api/custom-items/:id → updateCustomItem()", () => {
		it("should update custom item", async () => {
			const customItem = await CustomItem.create({
				user: testUser._id,
				name: "Old Name",
				ingredients: [testIngredient._id],
				totalPrice: 0.5,
			});

			const req = {
				user: { _id: testUser._id },
				params: { id: customItem._id.toString() },
				body: {
					name: "New Name",
					totalPrice: 1.0,
				},
			};
			const res = mockRes();

			await updateCustomItem(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			const call = res.json.mock.calls[0][0];
			expect(call.customItem.name).toBe("New Name");
			expect(call.customItem.totalPrice).toBe(1.0);
		});

		it("should return 400 for invalid ID", async () => {
			const req = {
				user: { _id: testUser._id },
				params: { id: "invalid_id" },
				body: { name: "Test" },
			};
			const res = mockRes();

			await updateCustomItem(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
		});

		it("should return 404 if trying to update another user's item", async () => {
			const otherUser = await User.create({
				name: "Other User",
				email: "other@example.com",
				password: "password123",
			});

			const customItem = await CustomItem.create({
				user: otherUser._id,
				name: "Other's Item",
				ingredients: [testIngredient._id],
				totalPrice: 0.5,
			});

			const req = {
				user: { _id: testUser._id },
				params: { id: customItem._id.toString() },
				body: { name: "Hacked Name" },
			};
			const res = mockRes();

			await updateCustomItem(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
		});
	});
});
