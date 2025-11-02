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
});

beforeEach(async () => {
  await MenuItem.deleteMany();
});

afterAll(async () => {
  // ✅ Close cleanly to avoid "environment torn down" error
  await mongoose.connection.close();
  await mongoServer.stop();
  await new Promise(resolve => setTimeout(resolve, 100)); // small delay
});

// ---------- TESTS ----------

describe("Menu API", () => {
  it("GET /api/menu → should return empty array initially", async () => {
    const res = await request(app).get("/api/menu");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("POST /api/menu → should add a new menu item", async () => {
    const newItem = { name: "Latte", price: 3.5, category: "Coffee" };
    const res = await request(app).post("/api/menu").send(newItem);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Latte");
    expect(res.body.available).toBe(true);
  });

  it("PUT /api/menu/:id → should update an item", async () => {
    const item = await MenuItem.create({ name: "Mocha", price: 4.5, category: "Coffee" });
    const res = await request(app)
      .put(`/api/menu/${item._id}`)
      .send({ price: 5 });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(5);
  });

  it("PATCH /api/menu/:id/archive → should soft delete item", async () => {
    const item = await MenuItem.create({ name: "Espresso", price: 2.5, category: "Coffee" });
    const res = await request(app).patch(`/api/menu/${item._id}/archive`);
    expect(res.status).toBe(200);
    const archived = await MenuItem.findById(item._id);
    expect(archived.available).toBe(false);
  });

  it("PATCH /api/menu/:id/restore → should restore item", async () => {
    const item = await MenuItem.create({ name: "Cappuccino", price: 3, category: "Coffee", available: false });
    const res = await request(app).patch(`/api/menu/${item._id}/restore`);
    expect(res.status).toBe(200);
    const restored = await MenuItem.findById(item._id);
    expect(restored.available).toBe(true);
  });

  it("DELETE /api/menu/:id → should hard delete item", async () => {
    const item = await MenuItem.create({ name: "Latte", price: 3.5, category: "Coffee" });
    const res = await request(app).delete(`/api/menu/${item._id}`);
    expect(res.status).toBe(200);
    const found = await MenuItem.findById(item._id);
    expect(found).toBeNull();
  });
});
