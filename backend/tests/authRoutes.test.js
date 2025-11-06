// tests/authRoutes.test.js
import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// 🧩 Mock all middleware and controllers
jest.unstable_mockModule("../api/middleware/authMiddleware.js", () => ({
  verifyToken: jest.fn((req, res, next) => next())
}));

jest.unstable_mockModule("../api/middleware/roleMiddleware.js", () => ({
  allowRoles: jest.fn(() => (req, res, next) => next())
}));

jest.unstable_mockModule("../api/controllers/authController.js", () => ({
  register: jest.fn((req, res) => res.status(201).json({ message: "User registered" })),
  login: jest.fn((req, res) => res.status(200).json({ token: "fake-jwt-token" })),
  getProfile: jest.fn((req, res) => res.json({ id: 1, name: "Rujuta" })),
  getAllUsers: jest.fn((req, res) => res.json([{ id: 1, name: "Admin" }]))
}));

// ✅ Import mocks
const { verifyToken } = await import("../api/middleware/authMiddleware.js");
const { allowRoles } = await import("../api/middleware/roleMiddleware.js");
const { register, login, getProfile, getAllUsers } = await import("../api/controllers/authController.js");

// 🧩 Import route after mocks
const { default: authRoutes } = await import("../api/routes/authRoutes.js");

describe("🔐 Auth Routes", () => {
  let app, server;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/auth", authRoutes);

    // fallback 404
    app.use((req, res) => res.status(404).json({ error: "Not found" }));

    server = app.listen(0);
  });

  afterAll(async () => {
    if (server?.listening) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("POST /api/auth/register → should call register controller", async () => {
    const res = await request(server)
      .post("/api/auth/register")
      .send({ email: "a@b.com", password: "pass" });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("User registered");
    expect(register).toHaveBeenCalledTimes(1);
  });

  it("POST /api/auth/login → should call login controller", async () => {
    const res = await request(server)
      .post("/api/auth/login")
      .send({ email: "a@b.com", password: "pass" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe("fake-jwt-token");
    expect(login).toHaveBeenCalledTimes(1);
  });

  it("GET /api/auth/me → should call verifyToken and getProfile", async () => {
    const res = await request(server).get("/api/auth/me");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Rujuta");
    expect(verifyToken).toHaveBeenCalledTimes(1);
    expect(getProfile).toHaveBeenCalledTimes(1);
  });

  it("GET /api/auth/users → should call all middlewares and getAllUsers", async () => {
    const res = await request(server).get("/api/auth/users");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, name: "Admin" }]);
    expect(verifyToken).toHaveBeenCalledTimes(2);
    expect(allowRoles).toHaveBeenCalledTimes(1);
    expect(getAllUsers).toHaveBeenCalledTimes(1);
  });

  /*
  it("GET /api/auth/users → should block non-admin roles", async () => {
    allowRoles.mockReturnValueOnce((req, res) =>
      res.status(403).json({ error: "Forbidden: Admins only" })
    );

    const res = await request(server).get("/api/auth/users");
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Admins only/);
  });
  */

  it("GET /api/auth/unknown → should return 404 JSON", async () => {
    const res = await request(server).get("/api/auth/unknown");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Not found");
  });
});
