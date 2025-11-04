import express from "express";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { register, login, getProfile, getAllUsers } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getProfile);

// protected routes
router.get("/users", verifyToken, allowRoles("admin"), getAllUsers);

export default router;
