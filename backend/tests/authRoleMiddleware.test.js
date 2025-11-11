/**
 * Integration test for allowRoles middleware
 * ✅ Verifies admin vs customer route access
 * ✅ Uses ESM-safe imports
 */

import { jest, describe, test, beforeAll, afterAll, expect } from "@jest/globals";
import express from "express";
import request from "supertest";

// --- Mock jsonwebtoken ---
const verifyMock = jest.fn();
jest.unstable_mockModule("jsonwebtoken", () => ({
  default: { verify: verifyMock }
}));

// --- Import middlewares after mocks ---
const { verifyToken } = await import("../api/middleware/authMiddleware.js");
const { allowRoles } = await import("../api/middleware/roleMiddleware.js");

describe("🔐 allowRoles Middleware (Role-based Access)", () => {
  let app, server, baseURL;

  beforeAll((done) => {
    process.env.JWT_SECRET = "supersecret";
    process.env.NODE_ENV = "development"; // normal mode

    app = express();
    app.use(express.json());

    // ✅ Protected route that only admins can access
    app.get("/admin-only", verifyToken, allowRoles("admin"), (req, res) => {
      res.json({ ok: true, role: req.user.role });
    });

    // ✅ Route accessible to any authenticated user
    app.get("/customer", verifyToken, (req, res) => {
      res.json({ ok: true, role: req.user.role });
    });

    server = app.listen(0, () => {
      const { port } = server.address();
      baseURL = `http://127.0.0.1:${port}`;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  test("🚫 blocks non-admin user from admin-only route", async () => {
    const fakeToken = "abc.def.ghi";
    verifyMock.mockReturnValueOnce({ _id: "u1", role: "customer" });

    const res = await request(baseURL)
      .get("/admin-only")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/forbidden|insufficient/i);
  });

  test("✅ allows admin user to access admin-only route", async () => {
    const fakeToken = "xyz.123.abc";
    verifyMock.mockReturnValueOnce({ _id: "a1", role: "admin" });

    const res = await request(baseURL)
      .get("/admin-only")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.role).toBe("admin");
  });

  test("✅ allows any authenticated user to access open route", async () => {
    const fakeToken = "foo.bar.baz";
    verifyMock.mockReturnValueOnce({ _id: "c1", role: "customer" });

    const res = await request(baseURL)
      .get("/customer")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.role).toBe("customer");
  });
});
