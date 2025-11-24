import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { createOrder, getAllOrders, updateOrderStatus, getUserOrderHistory } from "../controllers/orderController.js";

const router = express.Router();
router.post("/", verifyToken, createOrder);
router.get("/", verifyToken, allowRoles("admin"), getAllOrders);
router.get("/history", verifyToken, getUserOrderHistory);
router.patch("/:id", verifyToken, allowRoles("admin"), updateOrderStatus);

export default router;
