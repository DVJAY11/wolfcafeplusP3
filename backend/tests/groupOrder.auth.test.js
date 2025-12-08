// tests/groupOrder.auth.test.js
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";

import app from "../server.js";
import GroupOrder from "../api/models/GroupOrder.js";
import MenuItem from "../api/models/MenuItem.js";
import Order from "../api/models/Order.js";

dotenv.config();

describe("Group Order API – Auth protection", () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    await Promise.all([
      GroupOrder.deleteMany({}),
      MenuItem.deleteMany({}),
      Order.deleteMany({}),
    ]);
  }, 30000);

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
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
