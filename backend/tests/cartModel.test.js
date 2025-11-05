import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Cart from "../api/models/Cart.js";
import MenuItem from "../api/models/MenuItem.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Cart Model", () => {
  let menuItem;

  beforeEach(async () => {
    await Cart.deleteMany();
    await MenuItem.deleteMany();

    menuItem = await MenuItem.create({
      name: "Latte",
      description: "Smooth espresso with milk",
      price: 4.5,
      available: true,
    });
  });

  it("should create a cart with a valid menuItem reference", async () => {
    const cart = await Cart.create({
      items: [{ menuItem: menuItem._id, quantity: 2 }],
    });

    const found = await Cart.findById(cart._id).populate("items.menuItem");

    expect(found).toBeTruthy();
    expect(found.items[0].menuItem.name).toBe("Latte");
    expect(found.items[0].quantity).toBe(2);
  });

  it("should default quantity to 1 when not specified", async () => {
    const cart = await Cart.create({
      items: [{ menuItem: menuItem._id }],
    });
    expect(cart.items[0].quantity).toBe(1);
  });

  it("should fail if menuItem is missing", async () => {
    const invalidCart = new Cart({
      items: [{ quantity: 1 }],
    });
    let error;
    try {
      await invalidCart.validate();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.errors["items.0.menuItem"]).toBeDefined();
  });

  it("should fail if quantity < 1", async () => {
    const invalidCart = new Cart({
      items: [{ menuItem: menuItem._id, quantity: 0 }],
    });
    await expect(invalidCart.validate()).rejects.toThrow();
  });
});
