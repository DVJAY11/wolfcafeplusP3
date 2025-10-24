import express from "express";
import {
  getMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem
} from "../controllers/menuController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public: everyone can view menu
router.get("/", getMenu);

// Admin-only routes
router.post("/", verifyToken, allowRoles("admin"), addMenuItem);
router.put("/:id", verifyToken, allowRoles("admin"), updateMenuItem);
router.delete("/:id", verifyToken, allowRoles("admin"), deleteMenuItem);

export default router;
