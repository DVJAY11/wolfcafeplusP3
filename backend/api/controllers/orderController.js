import Order from "../models/Order.js";
import { io } from "../../server.js";

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user").populate("items.menuItem");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!order) return res.status(404).json({ message: "Order not found" });

    // If order becomes "ready", notify user
    if (status === "ready") {
      io.to(order.user.toString()).emit("order_ready", {
        orderId: order._id,
        message: "Your order is ready for pickup!"
      });
    }

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
