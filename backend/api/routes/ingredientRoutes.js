import express from "express";
import {
	getIngredients,
	addIngredient,
	updateIngredient,
	deleteIngredient,
	validateCustomItem,
} from "../controllers/ingredientController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public: everyone can view ingredients
router.get("/", getIngredients);

// Protected: validate custom item (authenticated users)
router.post("/validate", verifyToken, validateCustomItem);

// Admin-only routes
router.post("/", verifyToken, allowRoles("admin"), addIngredient);
router.put("/:id", verifyToken, allowRoles("admin"), updateIngredient);
router.delete("/:id", verifyToken, allowRoles("admin"), deleteIngredient);

export default router;
