/**
 * Integration test for allowRoles middleware
 * ✅ ESM-safe
 * ✅ Uses real Express server
 * ✅ Closes cleanly (no open handles)
 */

import { jest, describe, test, beforeAll, afterAll, expect } from "@jest/globals";
import express from "express";
import request from "supertest";

// Import middleware directly (no mocks needed)
import { allowRoles } from "../api/middleware/roleMiddleware.js";

describe("🛡️ allowRoles Middleware", () => {
  let app, server, baseURL;

  beforeAll((done) => {
    app = express();
    app.use(express.json());

    // Sample routes with role check
    app.get(
      "/admin",
      (req, res, next) => {
        req.user = { role: "admin" };
        next();
      },
      allowRoles("admin", "staff"),
      (req, res) => res.json({ message: "Welcome Admin!" })
    );

    app.get(
      "/staff-only",
      (req, res, next) => {
        req.user = { role: "customer" };
        next();
      },
      allowRoles("staff"),
      (req, res) => res.json({ message: "Welcome Staff!" })
    );

    server = app.listen(0, () => {
      const { port } = server.address();
      baseURL = `http://127.0.0.1:${port}`;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  test("✅ always allows when NODE_ENV=test", async () => {
    process.env.NODE_ENV = "test";
    const res = await request(baseURL).get("/staff-only");
    expect(res.status).toBe(200); // passes because test mode bypasses
    process.env.NODE_ENV = "development"; // reset
  });

  test("✅ allows when user has permitted role", async () => {
    process.env.NODE_ENV = "development";
    const res = await request(baseURL).get("/admin");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Welcome Admin!");
  });

  test("🚫 blocks when user role not allowed", async () => {
    const res = await request(baseURL).get("/staff-only");
    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Forbidden: Insufficient role");
  });
});
