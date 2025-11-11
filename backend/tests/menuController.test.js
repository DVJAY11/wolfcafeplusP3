import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../server.js";
import MenuItem from "../api/models/MenuItem.js";
import Cart from "../api/models/Cart.js";

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

  it("PATCH /api/menu/:id/archive → should mark item unavailable AND remove it from all carts", async () => {
    // 1️⃣ Create a menu item
    const item = await MenuItem.create({
      name: "Americano",
      price: 2.5,
      category: "Coffee",
      available: true,
    });

    // 2️⃣ Create two carts that contain that menu item
    await Cart.create({
      items: [{ menuItem: item._id, quantity: 1 }],
    });
    await Cart.create({
      items: [{ menuItem: item._id, quantity: 2 }],
    });

    // 3️⃣ Archive (soft delete) the item
    const res = await request(app).patch(`/api/menu/${item._id}/archive`);

    // 4️⃣ Check API response
    expect(res.status).toBe(200);
    expect(res.body.item.available).toBe(false);
    expect(res.body.message).toMatch(/archived/i);

    // 5️⃣ Verify menu item is now unavailable in DB
    const updated = await MenuItem.findById(item._id);
    expect(updated.available).toBe(false);

    // 6️⃣ Verify all carts no longer contain the item
    const carts = await Cart.find({ "items.menuItem": item._id });
    expect(carts.length).toBe(0);
  });

  it("PATCH /api/menu/:id/restore → should mark item available again and NOT modify carts", async () => {
    // 1️⃣ Create a menu item (archived/unavailable)
    const item = await MenuItem.create({
      name: "Cold Brew",
      price: 3.75,
      category: "Coffee",
      available: false,
    });

    // 2️⃣ Create a cart that currently has *no* items
    const emptyCart = await Cart.create({ items: [] });

    // 3️⃣ Try restoring the item
    const res = await request(app).patch(`/api/menu/${item._id}/restore`);

    // 4️⃣ Check API response
    expect(res.status).toBe(200);
    expect(res.body.item.available).toBe(true);
    expect(res.body.message).toMatch(/restored/i);

    // 5️⃣ Verify menu item is now available in DB
    const restored = await MenuItem.findById(item._id);
    expect(restored.available).toBe(true);

    // 6️⃣ Verify that existing carts were not modified
    const cartAfter = await Cart.findById(emptyCart._id);
    expect(cartAfter.items.length).toBe(0);
  });

});