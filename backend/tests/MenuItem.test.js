import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
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

describe("MenuItem Model", () => {
  beforeEach(async () => {
    await MenuItem.deleteMany();
  });

  it("should create a menu item with required fields", async () => {
    const item = await MenuItem.create({
      name: "Latte",
      description: "Smooth espresso with steamed milk",
      price: 4.5,
      category: "Coffee",
      image: "https://example.com/latte.jpg",
    });

    expect(item._id).toBeDefined();
    expect(item.name).toBe("Latte");
    expect(item.price).toBe(4.5);
    expect(item.available).toBe(true); // default value
  });

  it("should set `available` to true by default", async () => {
    const item = await MenuItem.create({
      name: "Cappuccino",
      price: 3.75,
    });
    expect(item.available).toBe(true);
  });

  it("should fail validation if name is missing", async () => {
    const invalidItem = new MenuItem({ price: 4.0 });
    await expect(invalidItem.validate()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("should fail validation if price is missing", async () => {
    const invalidItem = new MenuItem({ name: "Espresso" });
    await expect(invalidItem.validate()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("should store timestamps automatically", async () => {
    const item = await MenuItem.create({
      name: "Mocha",
      price: 5.0,
    });
    expect(item.createdAt).toBeDefined();
    expect(item.updatedAt).toBeDefined();
  });

  it("should allow optional fields (category, image, description)", async () => {
    const item = await MenuItem.create({
      name: "Americano",
      price: 2.75,
    });
    expect(item.description).toBeUndefined();
    expect(item.category).toBeUndefined();
    expect(item.image).toBeUndefined();
  });
});
