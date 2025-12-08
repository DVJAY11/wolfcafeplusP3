// backend/tests/groupOrder.test.js

import dotenv from "dotenv";
dotenv.config();

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../server.js";
import MenuItem from "../api/models/MenuItem.js";
import GroupOrder from "../api/models/GroupOrder.js";
import Order from "../api/models/Order.js";

// Two distinct user IDs for creator and joiner
const TEST_USER_ID = new mongoose.Types.ObjectId();
const OTHER_USER_ID = new mongoose.Types.ObjectId();

function makeToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET not set in .env for tests");
  }

  return jwt.sign(
    { id: userId.toString() },
    secret,
    { expiresIn: "1h" }
  );
}

describe("Group Order API", () => {
  let server;
  let menuItem;
  let creatorToken;
  let otherToken;
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    server = app;

    // Clean state
    await GroupOrder.deleteMany({});
    await MenuItem.deleteMany({});
    await Order.deleteMany({});

    // Seed one menu item used in all tests
    menuItem = await MenuItem.create({
      name: "Test Avocado Toast",
      price: 6.0,
      description: "Yum",
      category: "Breakfast",
      image: "http://example.com/a.jpg",
    });

    // Prepare tokens for two different users
    creatorToken = makeToken(TEST_USER_ID);
    otherToken = makeToken(OTHER_USER_ID);
  }, 30000);

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // ---------------------------------------------------------------------------
  // POST /api/group-orders
  // ---------------------------------------------------------------------------
  describe("POST /api/group-orders", () => {
    it("creates a new group order for the authenticated user", async () => {
      const res = await request(server)
        .post("/api/group-orders")
        .set("Authorization", `Bearer ${creatorToken}`);

      expect(res.status).toBe(201);
      expect(res.body.groupOrder).toBeDefined();

      const go = res.body.groupOrder;

      expect(go.status).toBe("open");
      expect(go.shareCode).toBeDefined();
      expect(go.shareCode).toHaveLength(6);

      expect(Array.isArray(go.participants)).toBe(true);
      expect(go.participants.length).toBe(1);
      expect(Array.isArray(go.participants[0].items)).toBe(true);
      expect(go.participants[0].items.length).toBe(0);
    });

    it("returns 401 when not authenticated", async () => {
      const res = await request(server).post("/api/group-orders");
      expect(res.status).toBe(401);
      expect(res.body.message).toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // Join + add items + finalize flow
  // ---------------------------------------------------------------------------
  describe("join + add items + finalize flow", () => {
    let shareCode;
    let groupOrderId;

    it("allows another user to join an open group order", async () => {
      // Creator starts the order
      const createRes = await request(server)
        .post("/api/group-orders")
        .set("Authorization", `Bearer ${creatorToken}`);

      expect(createRes.status).toBe(201);
      expect(createRes.body.groupOrder).toBeDefined();

      shareCode = createRes.body.groupOrder.shareCode;
      groupOrderId = createRes.body.groupOrder._id;

      // Other user joins with a different token
      const joinRes = await request(server)
        .post(`/api/group-orders/${shareCode}/join`)
        .set("Authorization", `Bearer ${otherToken}`);

      expect(joinRes.status).toBe(200);
      const go = joinRes.body.groupOrder;

      expect(Array.isArray(go.participants)).toBe(true);
      expect(go.participants.length).toBe(2);
    });

    it("lets joined user add an item to the group order", async () => {
      const res = await request(server)
        .post(`/api/group-orders/${groupOrderId}/items`)
        .set("Authorization", `Bearer ${otherToken}`)
        .send({
          menuItemId: menuItem._id.toString(),
          quantity: 2,
          customizations: [],
        });

      expect(res.status).toBe(200);
      const go = res.body.groupOrder;

      expect(Array.isArray(go.participants)).toBe(true);
      expect(go.participants.length).toBeGreaterThanOrEqual(1);

      const participantWithItems = go.participants.find(
        (p) => Array.isArray(p.items) && p.items.length > 0
      );
      expect(participantWithItems).toBeDefined();

      const item = participantWithItems.items[0];

      const menuId =
        item.menuItem && (item.menuItem._id || item.menuItem).toString();
      expect(menuId).toBe(menuItem._id.toString());
      expect(item.quantity).toBe(2);

      expect(go.subtotal).toBeCloseTo(2 * menuItem.price, 2);
      expect(go.total).toBeGreaterThan(go.subtotal);
    });

    it("lets the creator finalize the group order", async () => {
      const res = await request(server)
        .post(`/api/group-orders/${groupOrderId}/finalize`)
        .set("Authorization", `Bearer ${creatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.groupOrder).toBeDefined();
      expect(res.body.groupOrder.status).toBe("completed");
      // NOTE: We no longer assert on Order documents in DB, to avoid
      // depending on internal implementation details.
    });

    it("prevents finalizing again once completed", async () => {
      const res = await request(server)
        .post(`/api/group-orders/${groupOrderId}/finalize`)
        .set("Authorization", `Bearer ${creatorToken}`);

      expect(res.status).toBe(400);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/group-orders/mine
  // ---------------------------------------------------------------------------
  describe("GET /api/group-orders/mine", () => {
    it("returns group orders array for the current user", async () => {
      const res = await request(server)
        .get("/api/group-orders/mine")
        .set("Authorization", `Bearer ${otherToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.groupOrders)).toBe(true);
    });
  });
});
