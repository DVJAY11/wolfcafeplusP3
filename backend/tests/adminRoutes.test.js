// tests/adminRoutes.test.js
import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// 🧩 Mock dependencies first
jest.unstable_mockModule("../api/middleware/authMiddleware.js", () => ({
  verifyToken: jest.fn((req, res, next) => next())
}));
jest.unstable_mockModule("../api/middleware/roleMiddleware.js", () => ({
  allowRoles: jest.fn(() => (req, res, next) => next())
}));
jest.unstable_mockModule("../api/controllers/adminController.js", () => ({
  getAdminStats: jest.fn((req, res) => res.json({ users: 10, orders: 5 }))
}));
jest.unstable_mockModule("../api/controllers/adminStatsController.js", () => ({
  getItemsSoldStats: jest.fn((req, res) => res.json({ items: [] })),
  getTimeSeriesStats: jest.fn((req, res) => res.json({ dailyStats: [] })),
  getProductTrends: jest.fn((req, res) => res.json({ products: [] }))
}));

// 🧩 Dynamically import route after mocks applied
const { default: adminRoutes } = await import("../api/routes/adminRoutes.js");

describe("🧑‍💼 Admin Routes", () => {
  let app, server;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/admin", adminRoutes);

    // catch-all 404 for robustness
    app.use((req, res) => res.status(404).json({ error: "Not found" }));

    server = app.listen(0);
  });

  afterAll(async () => {
    if (server?.listening) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("GET /api/admin/ping → should return live message", async () => {
    const res = await request(server).get("/api/admin/ping");
    expect(res.status).toBe(200);
    expect(res.text).toBe("Admin route is live!");
  });

  it(
    "GET /api/admin/stats → should return stats JSON with correct structure",
    async () => {
      const res = await request(server).get("/api/admin/stats");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ users: 10, orders: 5 });
    },
    10000
  );

  it("GET /api/admin/stats/items-sold → should return items sold stats", async () => {
    const res = await request(server).get("/api/admin/stats/items-sold");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("items");
  });

  it("GET /api/admin/stats/time-series → should return time series stats", async () => {
    const res = await request(server).get("/api/admin/stats/time-series");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("dailyStats");
  });

  it("GET /api/admin/stats/product-trends → should return product trends", async () => {
    const res = await request(server).get("/api/admin/stats/product-trends");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("products");
  });

  it("GET /api/admin/unknown → should return 404 JSON", async () => {
    const res = await request(server).get("/api/admin/unknown");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Not found");
  });
});
