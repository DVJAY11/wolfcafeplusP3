import User from "../models/User.js";
import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";

// GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  try {
    // Example: adjust to your schema names
    const totalUsers = await User.countDocuments();
    const totalMenuItems = await MenuItem.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = revenueAgg.length ? revenueAgg[0].total : 0;

    res.json({ totalUsers, totalMenuItems, totalOrders, totalRevenue });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats", error: err.message });
  }
};
