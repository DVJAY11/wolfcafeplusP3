// tests/groupOrder.auth.test.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import request from "supertest";

import app from "../server.js";
import GroupOrder from "../api/models/GroupOrder.js";
import MenuItem from "../api/models/MenuItem.js";
import Order from "../api/models/Order.js";

dotenv.config();

const uri = process.env.MONGO_URI;

describe("Group Order API – Auth protection", () => {
  beforeAll(async () => {
    if (!uri) {
      throw new Error("MONGO_URI not set in .env for tests");
    }

    await mongoose.connect(uri, {
      dbName: "wrikicafe_test_group_orders_auth",
    });

    await Promise.all([
      GroupOrder.deleteMany({}),
      MenuItem.deleteMany({}),
      Order.deleteMany({}),
    ]);
  }, 30000);

  afterAll(async () => {
    try {
      await mongoose.connection.dropDatabase();
    } catch (e) {
      console.error(
        "dropDatabase failed in auth tests (safe to ignore in local dev):",
        e.message
      );
    }
    await mongoose.disconnect();
  });

  it("rejects creating a group order without auth", async () => {
    const res = await request(app).post("/api/group-orders");
    expect(res.status).toBe(401);
  });

  it("rejects joining a group order without auth", async () => {
    const res = await request(app).post("/api/group-orders/FAKE12/join");
    expect(res.status).toBe(401);
  });

  it("rejects adding items to a group order without auth", async () => {
    // any valid-looking ObjectId string
    const fakeGroupOrderId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .post(`/api/group-orders/${fakeGroupOrderId}/items`)
      .send({
        menuItemId: new mongoose.Types.ObjectId().toString(),
        quantity: 1,
        customizations: [],
      });

    expect(res.status).toBe(401);
  });

  it("rejects finalizing a group order without auth", async () => {
    const fakeGroupOrderId = new mongoose.Types.ObjectId().toString();

    const res = await request(app).post(
      `/api/group-orders/${fakeGroupOrderId}/finalize`
    );

    expect(res.status).toBe(401);
  });

  it("rejects fetching /api/group-orders/mine without auth", async () => {
    const res = await request(app).get("/api/group-orders/mine");
    expect(res.status).toBe(401);
  });
});
