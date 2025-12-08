import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { getAdminStats } from "../controllers/adminController.js";
import { getItemsSoldStats, getTimeSeriesStats, getProductTrends } from "../controllers/adminStatsController.js";

const router = express.Router();

// ✅ test route
router.get("/ping", (req, res) => {
  res.send("Admin route is live!");
});

// ✅ metrics route - general admin stats
router.get("/stats", verifyToken, allowRoles("admin"), getAdminStats);

// ✅ best selling items stats route
router.get("/stats/items-sold", verifyToken, allowRoles("admin"), getItemsSoldStats);

// ✅ time-series stats route (daily trends)
router.get("/stats/time-series", verifyToken, allowRoles("admin"), getTimeSeriesStats);

// ✅ product-wise trends route
router.get("/stats/product-trends", verifyToken, allowRoles("admin"), getProductTrends);

export default router;
