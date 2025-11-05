import { jest } from "@jest/globals";
import { getAdminStats } from "../api/controllers/adminController.js";
import User from "../api/models/User.js";
import MenuItem from "../api/models/MenuItem.js";
import Order from "../api/models/Order.js";

// --- manual mock stubs ---
jest.spyOn(User, "countDocuments");
jest.spyOn(MenuItem, "countDocuments");
jest.spyOn(Order, "countDocuments");
jest.spyOn(Order, "aggregate");


jest.mock("../api/models/User.js");
jest.mock("../api/models/MenuItem.js");
jest.mock("../api/models/Order.js");

describe("AdminController → getAdminStats", () => {
  let req, res;

  beforeEach(() => {
    req = {}; // no input params
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it("✅ should return correct stats when data exists", async () => {
    User.countDocuments.mockResolvedValue(10);
    MenuItem.countDocuments.mockResolvedValue(5);
    Order.countDocuments.mockResolvedValue(20);
    Order.aggregate.mockResolvedValue([{ total: 150.75 }]);

    await getAdminStats(req, res);

    expect(User.countDocuments).toHaveBeenCalled();
    expect(MenuItem.countDocuments).toHaveBeenCalled();
    expect(Order.countDocuments).toHaveBeenCalled();
    expect(Order.aggregate).toHaveBeenCalledWith([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    expect(res.json).toHaveBeenCalledWith({
      totalUsers: 10,
      totalMenuItems: 5,
      totalOrders: 20,
      totalRevenue: 150.75,
    });
  });

  it("✅ should handle case when there are no orders (empty aggregate)", async () => {
    User.countDocuments.mockResolvedValue(2);
    MenuItem.countDocuments.mockResolvedValue(3);
    Order.countDocuments.mockResolvedValue(0);
    Order.aggregate.mockResolvedValue([]);

    await getAdminStats(req, res);

    expect(res.json).toHaveBeenCalledWith({
      totalUsers: 2,
      totalMenuItems: 3,
      totalOrders: 0,
      totalRevenue: 0,
    });
  });

  it("❌ should handle errors gracefully", async () => {
    const fakeError = new Error("Database failure");
    User.countDocuments.mockRejectedValue(fakeError);

    await getAdminStats(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error fetching stats",
      error: "Database failure",
    });
  });
});
