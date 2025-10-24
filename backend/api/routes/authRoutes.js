import express from "express";
import { getStatus } from "../controllers/baseController.js";
import { register, login } from "../controllers/authController.js";

const router = express.Router();


router.get("/", getStatus); // Simple health check route
router.post("/register", register);
router.post("/login", login);

export default router;
