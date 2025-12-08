import express from "express";
import {
	saveCustomItem,
	getCustomItems,
	getCustomItemById,
	deleteCustomItem,
	updateCustomItem,
} from "../controllers/customItemController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.post("/", verifyToken, saveCustomItem);
router.get("/", verifyToken, getCustomItems);
router.get("/:id", verifyToken, getCustomItemById);
router.put("/:id", verifyToken, updateCustomItem);
router.delete("/:id", verifyToken, deleteCustomItem);

export default router;
