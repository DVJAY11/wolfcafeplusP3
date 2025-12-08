// tests/groupOrder.model.test.js
import mongoose from "mongoose";
import GroupOrder from "../api/models/GroupOrder.js";

describe("GroupOrder Mongoose Model", () => {
  it("creates a group order with required fields and sensible defaults", async () => {
    const creatorId = new mongoose.Types.ObjectId();
    const participantId = new mongoose.Types.ObjectId();

    // expiresAt is required by your schema
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    const groupOrder = new GroupOrder({
      creator: creatorId,
      shareCode: "ABC123",
      participants: [
        {
          user: participantId,
          items: [],
        },
      ],
      expiresAt,
    });

    // This runs Mongoose validation without touching the DB
    await expect(groupOrder.validate()).resolves.toBeUndefined();

    // Basic field checks
    expect(groupOrder.creator.toString()).toBe(creatorId.toString());
    expect(groupOrder.shareCode).toBe("ABC123");
    expect(groupOrder.expiresAt).toEqual(expiresAt);

    // Defaults / types
    expect(groupOrder.status).toBeDefined();
    expect(typeof groupOrder.status).toBe("string");

    expect(groupOrder.subtotal).toBeDefined();
    expect(typeof groupOrder.subtotal).toBe("number");

    expect(groupOrder.total).toBeDefined();
    expect(typeof groupOrder.total).toBe("number");

    // Participants
    expect(Array.isArray(groupOrder.participants)).toBe(true);
    expect(groupOrder.participants.length).toBe(1);

    const p0 = groupOrder.participants[0];
    expect(p0.user.toString()).toBe(participantId.toString());
    expect(Array.isArray(p0.items)).toBe(true);
    expect(p0.items.length).toBe(0);
  });

  it("fails validation when required creator is missing", async () => {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const invalidOrder = new GroupOrder({
      shareCode: "NOCRTR",
      participants: [],
      expiresAt,
    });

    let error = null;
    try {
      await invalidOrder.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe("ValidationError");
    // Specifically missing creator
    expect(error.errors.creator).toBeDefined();
  });
});
