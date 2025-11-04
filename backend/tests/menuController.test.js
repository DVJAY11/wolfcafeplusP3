import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import app from "../server.js";
import MenuItem from "../api/models/MenuItem.js";

let mongoServer;

// helper to create JWTs
const createToken = (role = "admin") =>
  jwt.sign({ id: "testuser", role }, process.env.JWT_SECRET || "testsecret", {
    expiresIn: "1h",
  });

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

beforeEach(async () => {
  await MenuItem.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
  await new Promise((resolve) => setTimeout(resolve, 100));
});

// ---------- TESTS ----------

describe("Menu API", () => {
  const adminToken = `Bearer ${createToken("admin")}`;
  const userToken = `Bearer ${createToken("customer")}`;

  // ----- GET -----
  it("GET /api/menu → should return empty array initially", async () => {
    const res = await request(app).get("/api/menu");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("GET /api/menu → should return only available items", async () => {
    await MenuItem.create([
      { name: "Latte", price: 3.5, category: "Coffee", available: true },
      { name: "Hidden Drink", price: 4.5, category: "Coffee", available: false },
    ]);
    const res = await request(app).get("/api/menu");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("Latte");
  });

  // ----- POST -----
  it("POST /api/menu → should add a new menu item (admin)", async () => {
    const newItem = { name: "Latte", price: 3.5, category: "Coffee" };
    const res = await request(app)
      .post("/api/menu")
      .set("Authorization", adminToken)
      .send(newItem);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Latte");
    expect(res.body.available).toBe(true);
  });

  it("POST /api/menu → should reject if non-admin", async () => {
    const res = await request(app)
      .post("/api/menu")
      .set("Authorization", userToken)
      .send({ name: "Mocha", price: 4, category: "Coffee" });
    expect(res.status).toBe(403);
  });

  it("POST /api/menu → should validate missing fields", async () => {
    const res = await request(app)
      .post("/api/menu")
      .set("Authorization", adminToken)
      .send({ name: "" });
    expect(res.status).toBe(400);
  });

  // ----- PUT -----
  it("PUT /api/menu/:id → should update an item (admin)", async () => {
    const item = await MenuItem.create({
      name: "Mocha",
      price: 4.5,
      category: "Coffee",
    });
    const res = await request(app)
      .put(`/api/menu/${item._id}`)
      .set("Authorization", adminToken)
      .send({ price: 5 });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(5);
  });

  it("PUT /api/menu/:id → should reject non-admin", async () => {
    const item = await MenuItem.create({
      name: "Americano",
      price: 3,
      category: "Coffee",
    });
    const res = await request(app)
      .put(`/api/menu/${item._id}`)
      .set("Authorization", userToken)
      .send({ price: 6 });
    expect(res.status).toBe(403);
  });

  it("PUT /api/menu/:id → should return 404 for non-existent item", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/menu/${fakeId}`)
      .set("Authorization", adminToken)
      .send({ price: 6 });
    expect(res.status).toBe(404);
  });

  // ----- PATCH: Archive / Restore -----
  it("PATCH /api/menu/:id/archive → should soft delete item (admin)", async () => {
    const item = await MenuItem.create({
      name: "Espresso",
      price: 2.5,
      category: "Coffee",
    });
    const res = await request(app)
      .patch(`/api/menu/${item._id}/archive`)
      .set("Authorization", adminToken);
    expect(res.status).toBe(200);
    const archived = await MenuItem.findById(item._id);
    expect(archived.available).toBe(false);
  });

  it("PATCH /api/menu/:id/restore → should restore item (admin)", async () => {
    const item = await MenuItem.create({
      name: "Cappuccino",
      price: 3,
      category: "Coffee",
      available: false,
    });
    const res = await request(app)
      .patch(`/api/menu/${item._id}/restore`)
      .set("Authorization", adminToken);
    expect(res.status).toBe(200);
    const restored = await MenuItem.findById(item._id);
    expect(restored.available).toBe(true);
  });

  it("PATCH /api/menu/:id/archive → should reject non-admin", async () => {
    const item = await MenuItem.create({
      name: "Latte",
      price: 3.5,
      category: "Coffee",
    });
    const res = await request(app)
      .patch(`/api/menu/${item._id}/archive`)
      .set("Authorization", userToken);
    expect(res.status).toBe(403);
  });

  // ----- DELETE -----
  it("DELETE /api/menu/:id → should hard delete item (admin)", async () => {
    const item = await MenuItem.create({
      name: "Latte",
      price: 3.5,
      category: "Coffee",
    });
    const res = await request(app)
      .delete(`/api/menu/${item._id}`)
      .set("Authorization", adminToken);
    expect(res.status).toBe(200);
    const found = await MenuItem.findById(item._id);
    expect(found).toBeNull();
  });

  it("DELETE /api/menu/:id → should reject non-admin", async () => {
    const item = await MenuItem.create({
      name: "Mocha",
      price: 3.5,
      category: "Coffee",
    });
    const res = await request(app)
      .delete(`/api/menu/${item._id}`)
      .set("Authorization", userToken);
    expect(res.status).toBe(403);
  });

  it("DELETE /api/menu/:id → should return 404 for non-existent item", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/menu/${fakeId}`)
      .set("Authorization", adminToken);
    expect(res.status).toBe(404);
  });
});
