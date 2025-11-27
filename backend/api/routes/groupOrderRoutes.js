import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  createGroupOrder,
  getGroupOrder,
} from "../controllers/groupOrderController.js";

const router = express.Router();

router.post("/", verifyToken, createGroupOrder);
router.get("/:shareCode", verifyToken, getGroupOrder);

export default router;
