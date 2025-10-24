import express from "express";
import { getCart, addToCart, removeFromCart } from "../controllers/cartController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getCart);
router.post("/", verifyToken, addToCart);
router.delete("/:menuItemId", verifyToken, removeFromCart);

export default router;
