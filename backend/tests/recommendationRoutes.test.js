import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../server.js";
import MenuItem from "../api/models/MenuItem.js";

let mongoServer;

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	const uri = mongoServer.getUri();
	await mongoose.connect(uri);
}, 30000);

beforeEach(async () => {
	await MenuItem.deleteMany();
});

afterAll(async () => {
	await mongoose.connection.close();
	await mongoServer.stop();
	await new Promise(resolve => setTimeout(resolve, 100));
});

describe("Recommendation Routes", () => {
	describe("GET /api/recommend/smart-suggestions", () => {
		it("should be accessible and return 200 with valid parameters", async () => {
			await MenuItem.create({
				name: "Test Item",
				price: 5,
				category: "Test",
				prepTime: 10,
				available: true
			});

			const res = await request(app).get("/api/recommend/smart-suggestions?budget=10&timeAvailable=15");
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("suggestions");
			expect(res.body).toHaveProperty("count");
			expect(res.body).toHaveProperty("budget");
			expect(res.body).toHaveProperty("timeAvailable");
		});

		it("should return 400 for missing query parameters", async () => {
			const res = await request(app).get("/api/recommend/smart-suggestions");
			expect(res.status).toBe(400);
		});

		it("should handle decimal budget values", async () => {
			await MenuItem.create({
				name: "Test Item",
				price: 4.99,
				category: "Test",
				prepTime: 10,
				available: true
			});

			const res = await request(app).get("/api/recommend/smart-suggestions?budget=5.50&timeAvailable=15");
			expect(res.status).toBe(200);
			expect(res.body.suggestions.length).toBeGreaterThan(0);
		});

		it("should handle edge case with budget=0", async () => {
			const res = await request(app).get("/api/recommend/smart-suggestions?budget=0&timeAvailable=15");
			expect(res.status).toBe(400);
		});

		it("should handle edge case with timeAvailable=0", async () => {
			const res = await request(app).get("/api/recommend/smart-suggestions?budget=10&timeAvailable=0");
			expect(res.status).toBe(400);
		});

		it("should handle large budget values", async () => {
			await MenuItem.create({
				name: "Expensive Item",
				price: 100,
				category: "Premium",
				prepTime: 10,
				available: true
			});

			const res = await request(app).get("/api/recommend/smart-suggestions?budget=1000&timeAvailable=15");
			expect(res.status).toBe(200);
			expect(res.body.suggestions.length).toBeGreaterThan(0);
		});

		it("should handle large timeAvailable values", async () => {
			await MenuItem.create({
				name: "Slow Cook Item",
				price: 10,
				category: "Food",
				prepTime: 120,
				available: true
			});

			const res = await request(app).get("/api/recommend/smart-suggestions?budget=20&timeAvailable=200");
			expect(res.status).toBe(200);
			expect(res.body.suggestions.length).toBeGreaterThan(0);
		});
	});
});
