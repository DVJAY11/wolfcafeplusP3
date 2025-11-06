// tests/cartRoutes.test.js
import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// 🧩 Mock dependencies first
jest.unstable_mockModule("../api/middleware/authMiddleware.js", () => ({
  verifyToken: jest.fn((req, res, next) => next())
}));
jest.unstable_mockModule("../api/controllers/cartController.js", () => ({
  getCart: jest.fn((req, res) => res.json({ items: [] })),
  addToCart: jest.fn((req, res) => res.status(200).json({ message: "Item added" })),
  removeFromCart: jest.fn((req, res) => res.status(200).json({ message: "Item removed" }))
}));

// ✅ Import mocks for tracking
const { verifyToken } = await import("../api/middleware/authMiddleware.js");
const { getCart, addToCart, removeFromCart } = await import("../api/controllers/cartController.js");

// 🧩 Import route dynamically after mocks
const { default: cartRoutes } = await import("../api/routes/cartRoutes.js");

describe("🛒 Cart Routes", () => {
  let app, server;

  const buildServer = () => {
    const app = express();
    app.use(express.json());
    app.use("/api/cart", cartRoutes);
    app.use((req, res) => res.status(404).json({ error: "Not found" }));
    return app.listen(0);
  };

  beforeAll(() => {
    server = buildServer();
  });

  afterEach(async () => {
    // reset everything between tests
    jest.clearAllMocks();
    if (server?.listening) await new Promise((r) => server.close(r));
    server = buildServer();
  });

  afterAll(async () => {
    if (server?.listening) await new Promise((r) => server.close(r));
  });

  it("GET /api/cart → should call getCart and return items", async () => {
    const res = await request(server).get("/api/cart");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ items: [] });
    expect(verifyToken).toHaveBeenCalledTimes(1);
    expect(getCart).toHaveBeenCalledTimes(1);
  });

  it("POST /api/cart → should call addToCart and return success", async () => {
    const res = await request(server).post("/api/cart").send({ menuItemId: "123" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Item added");
    expect(verifyToken).toHaveBeenCalledTimes(1);
    expect(addToCart).toHaveBeenCalledTimes(1);
  });

  it("DELETE /api/cart/:menuItemId → should call removeFromCart and return success", async () => {
    const res = await request(server).delete("/api/cart/abc123");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Item removed");
    expect(verifyToken).toHaveBeenCalledTimes(1);
    expect(removeFromCart).toHaveBeenCalledTimes(1);
  });

  it("GET /api/cart → should return 403 if token fails", async () => {
    // simulate verifyToken denial
    verifyToken.mockImplementationOnce((req, res) =>
      res.status(403).json({ error: "Invalid token" })
    );

    const res = await request(server).get("/api/cart");
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Invalid token");
  });

  it("GET /api/cart/unknown → should return 404 JSON", async () => {
    const res = await request(server).get("/api/cart/unknown");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Not found");
  });
});
