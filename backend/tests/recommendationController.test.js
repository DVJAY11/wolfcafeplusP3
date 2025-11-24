import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../server.js";
import MenuItem from "../api/models/MenuItem.js";
import Order from "../api/models/Order.js";
import User from "../api/models/User.js";

let mongoServer;

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	const uri = mongoServer.getUri();
	await mongoose.connect(uri);
}, 30000);

beforeEach(async () => {
	await MenuItem.deleteMany();
	await Order.deleteMany();
	await User.deleteMany();
});

afterAll(async () => {
	await mongoose.connection.close();
	await mongoServer.stop();
	await new Promise(resolve => setTimeout(resolve, 100));
});

describe("Recommendation Controller", () => {
	describe("GET /api/recommend/smart-suggestions", () => {
		it("should return 400 if budget parameter is missing", async () => {
			const res = await request(app).get("/api/recommend/smart-suggestions?timeAvailable=15");
			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/budget.*required/i);
		});

		it("should return 400 if timeAvailable parameter is missing", async () => {
			const res = await request(app).get("/api/recommend/smart-suggestions?budget=20");
			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/timeAvailable.*required/i);
		});

		it("should return 400 if budget is not a positive number", async () => {
			const res = await request(app).get("/api/recommend/smart-suggestions?budget=-5&timeAvailable=15");
			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/budget.*positive/i);
		});

		it("should return 400 if timeAvailable is not a positive number", async () => {
			const res = await request(app).get("/api/recommend/smart-suggestions?budget=20&timeAvailable=0");
			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/time.*positive/i);
		});

		it("should return empty suggestions when no items match criteria", async () => {
			// Create items that don't match criteria
			await MenuItem.create([
				{ name: "Expensive Item", price: 100, category: "Premium", prepTime: 10, available: true },
				{ name: "Slow Item", price: 5, category: "Regular", prepTime: 60, available: true }
			]);

			const res = await request(app).get("/api/recommend/smart-suggestions?budget=10&timeAvailable=15");
			expect(res.status).toBe(200);
			expect(res.body.count).toBe(0);
			expect(res.body.suggestions).toEqual([]);
		});

		it("should return items matching budget and time constraints", async () => {
			await MenuItem.create([
				{ name: "Quick Latte", price: 4, category: "Coffee", prepTime: 5, available: true },
				{ name: "Regular Burger", price: 8, category: "Food", prepTime: 15, available: true },
				{ name: "Expensive Steak", price: 25, category: "Food", prepTime: 30, available: true },
				{ name: "Slow Roast", price: 10, category: "Food", prepTime: 45, available: true }
			]);

			const res = await request(app).get("/api/recommend/smart-suggestions?budget=10&timeAvailable=20");
			expect(res.status).toBe(200);
			expect(res.body.count).toBe(2);
			expect(res.body.suggestions.length).toBe(2);

			const names = res.body.suggestions.map(item => item.name);
			expect(names).toContain("Quick Latte");
			expect(names).toContain("Regular Burger");
		});

		it("should not return unavailable items", async () => {
			await MenuItem.create([
				{ name: "Available Item", price: 5, category: "Coffee", prepTime: 10, available: true },
				{ name: "Unavailable Item", price: 5, category: "Coffee", prepTime: 10, available: false }
			]);

			const res = await request(app).get("/api/recommend/smart-suggestions?budget=10&timeAvailable=15");
			expect(res.status).toBe(200);
			expect(res.body.suggestions.length).toBe(1);
			expect(res.body.suggestions[0].name).toBe("Available Item");
		});

		it("should sort items by popularity (order count)", async () => {
			const item1 = await MenuItem.create({
				name: "Popular Item", price: 5, category: "Coffee", prepTime: 10, available: true
			});
			const item2 = await MenuItem.create({
				name: "Less Popular Item", price: 6, category: "Coffee", prepTime: 10, available: true
			});
			const item3 = await MenuItem.create({
				name: "Unpopular Item", price: 7, category: "Coffee", prepTime: 10, available: true
			});

			// Create a user for orders
			const user = await User.create({
				name: "Test User",
				email: "test@test.com",
				password: "password123"
			});

			// Create orders to simulate popularity
			await Order.create({
				user: user._id,
				items: [{ menuItem: item1._id, quantity: 5 }],
				status: "completed"
			});
			await Order.create({
				user: user._id,
				items: [{ menuItem: item2._id, quantity: 2 }],
				status: "completed"
			});

			const res = await request(app).get("/api/recommend/smart-suggestions?budget=10&timeAvailable=15");
			expect(res.status).toBe(200);
			expect(res.body.suggestions.length).toBe(3);

			// Most popular should be first
			expect(res.body.suggestions[0].name).toBe("Popular Item");
			expect(res.body.suggestions[0].orderCount).toBe(5);
			expect(res.body.suggestions[1].name).toBe("Less Popular Item");
			expect(res.body.suggestions[1].orderCount).toBe(2);
		});

		it("should add reason tags based on price and time", async () => {
			await MenuItem.create([
				{ name: "Great Value Quick Item", price: 2, category: "Coffee", prepTime: 8, available: true },
				{ name: "Under Budget Slow Item", price: 15, category: "Food", prepTime: 25, available: true }
			]);

			const res = await request(app).get("/api/recommend/smart-suggestions?budget=20&timeAvailable=30");
			expect(res.status).toBe(200);

			const greatValueItem = res.body.suggestions.find(item => item.name === "Great Value Quick Item");
			expect(greatValueItem.reasons).toContain("Great Value");
			expect(greatValueItem.reasons).toContain("Quick Prep");

			const underBudgetItem = res.body.suggestions.find(item => item.name === "Under Budget Slow Item");
			expect(underBudgetItem.reasons).toContain("Under Budget");
			expect(underBudgetItem.reasons).toContain("Ready in Time");
		});

		it("should limit results to maximum 10 items", async () => {
			// Create 15 items matching criteria
			const items = [];
			for (let i = 0; i < 15; i++) {
				items.push({
					name: `Item ${i}`,
					price: 5,
					category: "Test",
					prepTime: 10,
					available: true
				});
			}
			await MenuItem.create(items);

			const res = await request(app).get("/api/recommend/smart-suggestions?budget=10&timeAvailable=15");
			expect(res.status).toBe(200);
			expect(res.body.suggestions.length).toBe(10);
			expect(res.body.count).toBe(10);
		});

		it("should return budget and timeAvailable in response", async () => {
			await MenuItem.create({
				name: "Test Item", price: 5, category: "Coffee", prepTime: 10, available: true
			});

			const res = await request(app).get("/api/recommend/smart-suggestions?budget=20&timeAvailable=30");
			expect(res.status).toBe(200);
			expect(res.body.budget).toBe(20);
			expect(res.body.timeAvailable).toBe(30);
		});
	});
});
