//orderRoutes.test.js

import { jest, describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import express from "express";
import request from "supertest";

// ---- Mock dependencies ----
jest.unstable_mockModule("../api/middleware/authMiddleware.js", () => ({
  verifyToken: jest.fn((req, res, next) => next())
}));

jest.unstable_mockModule("../api/middleware/roleMiddleware.js", () => ({
  allowRoles: jest.fn(() => (req, res, next) => next())
}));

jest.unstable_mockModule("../api/controllers/orderController.js", () => ({
  createOrder: jest.fn((req, res) => res.status(201).json({ message: "Order created" })),
  getAllOrders: jest.fn((req, res) => res.status(200).json([{ id: 1, total: 15.5 }])),
  updateOrderStatus: jest.fn((req, res) =>
    res.status(200).json({ message: "Order status updated" })
  )
}));

// Import router AFTER mocks are defined
const { default: router } = await import("../api/routes/orderRoutes.js");

// ---- Tests ----
describe("🧾 Order Routes (Integration)", () => {
  let app, server, baseURL;

  beforeAll((done) => {
    app = express();
    app.use(express.json());
    app.use("/api/orders", router);

    server = app.listen(0, () => {
      const { port } = server.address();
      baseURL = `http://127.0.0.1:${port}`;
      done();
    });
  });

  afterAll((done) => {
    if (server) server.close(done);
  });

  test("POST /api/orders → creates a new order", async () => {
    const res = await request(baseURL)
      .post("/api/orders")
      .send({ user: "abc123", items: [{ name: "Latte", qty: 1 }] });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Order created");
  });

  test("GET /api/orders → returns all orders (admin)", async () => {
    const res = await request(baseURL).get("/api/orders");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("id", 1);
  });

  test("PATCH /api/orders/:id → updates order status", async () => {
    const res = await request(baseURL)
      .patch("/api/orders/123")
      .send({ status: "completed" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Order status updated");
  });
});
