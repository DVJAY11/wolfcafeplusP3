import express from "express";
import { getSmartSuggestions } from "../controllers/recommendationController.js";

const router = express.Router();

// GET /api/recommend/smart-suggestions?budget=20&timeAvailable=15
router.get("/smart-suggestions", getSmartSuggestions);

export default router;
