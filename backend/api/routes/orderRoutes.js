import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { getAllOrders, updateOrderStatus } from "../controllers/orderController.js";

const router = express.Router();

router.get("/", verifyToken, allowRoles("admin"), getAllOrders);
router.patch("/:id", verifyToken, allowRoles("admin"), updateOrderStatus);

export default router;
