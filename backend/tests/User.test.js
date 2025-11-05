import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcrypt";
import User from "../api/models/User.js";

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

describe("🧪 User Model", () => {
  beforeEach(async () => {
    await User.deleteMany();
  });

  it("should create a user with required fields", async () => {
    const user = await User.create({
      name: "Alice",
      email: "alice@example.com",
      password: "mypassword123",
      role: "customer",
    });

    expect(user._id).toBeDefined();
    expect(user.email).toBe("alice@example.com");
    expect(user.role).toBe("customer");
  });

  it("🔒 should hash the password before saving", async () => {
    const plainPassword = "secret123";
    const user = await User.create({
      name: "Bob",
      email: "bob@example.com",
      password: plainPassword,
    });

    // The stored password should NOT equal the plaintext one
    expect(user.password).not.toBe(plainPassword);

    // The hashed password should verify correctly using bcrypt
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    expect(isMatch).toBe(true);
  });

  it("should not re-hash password if unchanged", async () => {
    const user = await User.create({
      name: "Carol",
      email: "carol@example.com",
      password: "initial123",
    });

    const originalHash = user.password;

    // Update name only
    user.name = "Carol Updated";
    await user.save();

    expect(user.password).toBe(originalHash);
  });

  it("should fail validation if email is missing", async () => {
    const invalidUser = new User({ password: "abc123" });
    await expect(invalidUser.validate()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("should fail validation if password is missing", async () => {
    const invalidUser = new User({ email: "missingpass@example.com" });
    await expect(invalidUser.validate()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("should enforce unique email constraint", async () => {
    await User.create({
      email: "dupe@example.com",
      password: "123456",
    });

    // Attempt to create another user with the same email
    await expect(
      User.create({
        email: "dupe@example.com",
        password: "abcdef",
      })
    ).rejects.toThrow();
  });

  it("should default role to 'customer' if not provided", async () => {
    const user = await User.create({
      email: "defaultrole@example.com",
      password: "pass123",
    });
    expect(user.role).toBe("customer");
  });

  it("should reject invalid roles", async () => {
    const invalidUser = new User({
      email: "wrongrole@example.com",
      password: "pass123",
      role: "superuser",
    });
    await expect(invalidUser.validate()).rejects.toThrow(mongoose.Error.ValidationError);
  });
});
