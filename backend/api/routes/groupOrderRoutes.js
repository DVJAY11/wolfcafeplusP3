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
} from "../controllers/groupOrderController.js";

const router = express.Router();

// Create a group order
router.post("/", verifyToken, createGroupOrder);

// Get group order details via shareCode (for join / view)
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
