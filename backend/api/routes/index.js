import express from "express";
import groupOrderRoutes from "./groupOrderRoutes.js";

import { getStatus } from "../controllers/baseController.js";

const router = express.Router();

router.get("/", getStatus);
router.use("/group-orders", groupOrderRoutes);

export default router;
