import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { getAdminStats } from "../controllers/adminController.js";

const router = express.Router();

// ✅ test route
router.get("/ping", (req, res) => {
  res.send("Admin route is live!");
});

// ✅ metrics route
router.get("/stats", verifyToken, allowRoles("admin"), getAdminStats);

export default router;
