import Order from "../models/Order.js";
import { io } from "../../server.js";
import { sendEmail } from "../utils/sendEmail.js"; // ✅ import mail util

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

    // ✅ If order becomes "ready", notify user by email + socket
    if (status === "ready" && order.user?.email) {
      await sendEmail(
        order.user.email,
        "Your WolfCafe+ Order is Ready for Pickup ☕",
        `Hi ${order.user.name || "there"},\n\nYour order #${order._id} is ready for pickup!\n\nSee you soon at WolfCafe+.\n\n– WolfCafe+ Team`
      );

      io.to(order.user._id.toString()).emit("order_ready", {
        orderId: order._id,
        message: "Your order is ready for pickup!",
      });
    }

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
