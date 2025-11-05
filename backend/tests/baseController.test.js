import express from "express";
import request from "supertest";
import { getStatus } from "../api/controllers/baseController.js"; // adjust path if needed

let app;

beforeAll(() => {
  app = express();
  app.get("/status", getStatus); // mount the controller on a test route
});

describe("🧩 baseController → getStatus", () => {
  it("should return a 200 response with correct message", async () => {
    const res = await request(app).get("/status");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "☕ WolfCafe+ backend running..." });
  });

  it("should respond with JSON format", async () => {
    const res = await request(app).get("/status");
    expect(res.headers["content-type"]).toMatch(/json/);
  });
});
