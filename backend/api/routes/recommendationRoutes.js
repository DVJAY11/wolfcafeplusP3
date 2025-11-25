import express from "express";
import {
	getSmartSuggestions,
	getPersonalizedRecommendations,
	getSimilarItemsController,
	updateUserPreferences,
} from "../controllers/recommendationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/recommend/smart-suggestions?budget=20&timeAvailable=15
// Public endpoint - no auth required
router.get("/smart-suggestions", getSmartSuggestions);

// GET /api/recommend/personalized?budget=20&timeAvailable=15&limit=10
// ML-powered personalized recommendations - requires authentication
router.get("/personalized", verifyToken, getPersonalizedRecommendations);

// GET /api/recommend/similar-items/:itemId?limit=5
// Find items similar to a given item - public endpoint
router.get("/similar-items/:itemId", getSimilarItemsController);

// POST /api/recommend/update-preferences
// Manually trigger user preference profile update - requires authentication
router.post("/update-preferences", verifyToken, updateUserPreferences);

export default router;

