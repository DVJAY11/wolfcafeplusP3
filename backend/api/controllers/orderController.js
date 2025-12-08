// 📁 api/controllers/orderController.js
import Order from "../models/Order.js";
import { io } from "../../server.js";
import { sendEmail } from "../utils/sendEmail.js";

export const createOrder = async (req, res) => {
  try {
    const { items, subtotal, tip, total } = req.body;
    if (!req.user || !req.user.id)
      return res.status(401).json({ message: "User not authenticated" });

    const newOrder = new Order({
      user: req.user.id,
      items,
      subtotal,
      tip: tip || 0,
      total,
      status: "pending",
    });

    await newOrder.save();

    // Optional: Emit socket event for staff/admin dashboards
    io.emit("new_order", newOrder);

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserOrderHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ message: "User not authenticated" });

    const orders = await Order.find({ user: req.user.id })
      .populate("items.menuItem")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user")
      .populate("items.menuItem");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user"); // ✅ populate user to access email

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Return response immediately (fast)
    res.status(200).json(order);

    // Fire-and-forget: run email + socket after responding
    if (status === "ready" && order.user?.email) {
      (async () => {
        try {
          await sendEmail(
            order.user.email,
            "Your WrikiCafe+ Order is Ready for Pickup ☕",
            `Hi ${order.user.name || "there"},\n\nYour order #${order._id} is ready for pickup!\n\nSee you soon at WrikiCafe+.\n\n– WrikiCafe+ Team`
          );

          io.to(order.user._id.toString()).emit("order_ready", {
            orderId: order._id,
            message: "Your order is ready for pickup!",
          });
        } catch (err) {
          console.error("❌ Fire-and-forget error:", err);
        }
      })();
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
