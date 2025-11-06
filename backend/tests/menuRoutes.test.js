/**
 * @file tests/menuRoutes.test.js
 * ✅ Integration tests for api/routes/menuRoutes.js (no open handle version)
 */

import { jest, describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import express from "express";

// Mock all controller + middleware modules
jest.unstable_mockModule("../api/controllers/menuController.js", () => ({
  getMenu: jest.fn((req, res) => res.json([{ name: "Latte", price: 4.5 }])),
  addMenuItem: jest.fn((req, res) => res.status(201).json({ message: "Item added" })),
  updateMenuItem: jest.fn((req, res) => res.json({ message: "Item updated" })),
  deleteMenuItem: jest.fn((req, res) => res.json({ message: "Item deleted" })),
  softDeleteMenuItem: jest.fn((req, res) => res.json({ message: "Item archived" })),
  restoreMenuItem: jest.fn((req, res) => res.json({ message: "Item restored" }))
}));

jest.unstable_mockModule("../api/middleware/authMiddleware.js", () => ({
  verifyToken: jest.fn((req, res, next) => next())
}));

jest.unstable_mockModule("../api/middleware/roleMiddleware.js", () => ({
  allowRoles: jest.fn(() => (req, res, next) => next())
}));

// Must import router *after* mocks
const { default: router } = await import("../api/routes/menuRoutes.js");

describe("🍽️ Menu Routes", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/menu", router);
  });

  afterAll(() => {
    // nothing to close — supertest handles server lifecycles internally
    jest.restoreAllMocks();
  });

  test("GET /api/menu → returns public menu", async () => {
    const res = await request(app).get("/api/menu");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("name", "Latte");
  });

  test("POST /api/menu → adds item (admin)", async () => {
    const res = await request(app)
      .post("/api/menu")
      .send({ name: "Mocha", price: 5.0 });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Item added");
  });

  test("PUT /api/menu/:id → updates item", async () => {
    const res = await request(app)
      .put("/api/menu/123")
      .send({ price: 6.0 });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Item updated");
  });

  test("DELETE /api/menu/:id → deletes item", async () => {
    const res = await request(app).delete("/api/menu/123");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Item deleted");
  });

  test("PATCH /api/menu/:id/archive → soft deletes item", async () => {
    const res = await request(app).patch("/api/menu/123/archive");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Item archived");
  });

  test("PATCH /api/menu/:id/restore → restores item", async () => {
    const res = await request(app).patch("/api/menu/123/restore");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Item restored");
  });
});
