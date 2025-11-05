/**
 * 🧑‍💻 Auth Controller Tests
 * Mirrors the style of menuController.test.js and uses in-memory MongoDB.
 */
import { jest } from "@jest/globals";

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { register, login, getProfile, getAllUsers } from "../api/controllers/authController.js";
import User from "../api/models/User.js";

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = "testsecret"; // for consistent JWT signing
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: "testDB" });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  jest.clearAllMocks();
  await User.deleteMany({});
});

describe("🧑‍💻 Auth Controller", () => {
  // helper mock response
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  describe("POST /api/auth/register → register()", () => {
    it("✅ should register a new user", async () => {
      const req = {
        body: { name: "Alice", email: "alice@example.com", password: "pass123", role: "customer" },
      };
      const res = mockRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "User registered" })
      );

      const user = await User.findOne({ email: "alice@example.com" });
      expect(user).toBeTruthy();
      expect(user.password).not.toBe("pass123"); // password should be hashed
    });

    it("🚫 should not register if user already exists", async () => {
      await User.create({ name: "Alice", email: "alice@example.com", password: "abc" });

      const req = {
        body: { name: "Alice", email: "alice@example.com", password: "abc" },
      };
      const res = mockRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "User already exists" });
    });
  });

  describe("POST /api/auth/login → login()", () => {
    it("✅ should login successfully and return a token", async () => {
        const user = await User.create({
            name: "Bob",
            email: "bob@example.com",
            password: "secret", // plain, model will hash it
            role: "customer",
        });

        const req = { body: { email: "bob@example.com", password: "secret" } };
        const res = mockRes();

        const tokenSpy = jest.spyOn(jwt, "sign").mockReturnValue("testtoken");

        await login(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
            token: "testtoken",
            user: expect.objectContaining({ name: "Bob", role: "customer" }),
            })
        );
        expect(tokenSpy).toHaveBeenCalled();
        });

    it("🚫 should return 404 for invalid email", async () => {
      const req = { body: { email: "missing@example.com", password: "secret" } };
      const res = mockRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("🚫 should return 401 for wrong password", async () => {
      const hashed = await bcrypt.hash("correct", 10);
      await User.create({ name: "Charlie", email: "charlie@example.com", password: hashed });

      const req = { body: { email: "charlie@example.com", password: "wrong" } };
      const res = mockRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    });
  });

  describe("GET /api/auth/profile → getProfile()", () => {
    it("✅ should return user profile", async () => {
      const user = await User.create({
        name: "Dana",
        email: "dana@example.com",
        password: "test",
        role: "customer",
      });

      const req = { user: { id: user._id } };
      const res = mockRes();

      await getProfile(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Dana", email: "dana@example.com" })
      );
    });

    it("🚫 should return 404 if user not found", async () => {
      const req = { user: { id: new mongoose.Types.ObjectId() } };
      const res = mockRes();

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
  });

  describe("GET /api/auth/users → getAllUsers()", () => {
    it("✅ should return all users", async () => {
      await User.create([
        { name: "Eve", email: "eve@example.com", password: "1" },
        { name: "Frank", email: "frank@example.com", password: "2" },
      ]);

      const req = {};
      const res = mockRes();

      await getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: "Eve" }),
          expect.objectContaining({ name: "Frank" }),
        ])
      );
    });
  });
});
