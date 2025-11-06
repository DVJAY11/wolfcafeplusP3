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

// ✅ Import mocks back to use for call tracking
const { verifyToken } = await import("../api/middleware/authMiddleware.js");
const { allowRoles } = await import("../api/middleware/roleMiddleware.js");
const { getAdminStats } = await import("../api/controllers/adminController.js");

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
    "GET /api/admin/stats → should call middlewares and return stats JSON",
    async () => {
      const res = await request(server).get("/api/admin/stats");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ users: 10, orders: 5 });

      // ✅ Verify mocks were invoked
      expect(verifyToken).toHaveBeenCalledTimes(1);
      expect(allowRoles).toHaveBeenCalledTimes(1);
      expect(getAdminStats).toHaveBeenCalledTimes(1);
    },
    10000
  );

  /*
  it("GET /api/admin/stats → should block non-admin roles", async () => {
    // simulate allowRoles denying access
    allowRoles.mockReturnValueOnce((req, res) =>
      res.status(403).json({ error: "Forbidden: Admins only" })
    );

    const res = await request(server).get("/api/admin/stats");
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Admins only/);
  });
  */

  it("GET /api/admin/unknown → should return 404 JSON", async () => {
    const res = await request(server).get("/api/admin/unknown");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Not found");
  });
});
