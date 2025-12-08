// backend/api/routes/groupOrderRoutes.js
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  createGroupOrder,
  getGroupOrder,
  joinGroupOrder,
  addItemToGroupOrder,
  removeItemFromGroupOrder,
  leaveGroupOrder,
  finalizeGroupOrder,
  getMyGroupOrders,
} from "../controllers/groupOrderController.js";

const router = express.Router();

/**
 * GET /api/group-orders/mine
 * Return all group orders that the logged-in user is part of
 */
router.get("/mine", verifyToken, getMyGroupOrders);

// Create a group order
router.post("/", verifyToken, createGroupOrder);

// Get group order details via shareCode (for join / view)
// NOTE: keep this BELOW `/mine` so "mine" doesn't get treated as :shareCode
router.get("/:shareCode", verifyToken, getGroupOrder);

// Join via share code
router.post("/:shareCode/join", verifyToken, joinGroupOrder);

// Add / remove items by groupOrder _id
router.post("/:id/items", verifyToken, addItemToGroupOrder);
router.delete("/:id/items/:itemId", verifyToken, removeItemFromGroupOrder);

// Leave & finalize
router.delete("/:id/leave", verifyToken, leaveGroupOrder);
router.post("/:id/finalize", verifyToken, finalizeGroupOrder);

export default router;
