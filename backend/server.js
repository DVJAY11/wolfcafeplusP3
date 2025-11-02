import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./api/config/db.js";
import apiRoutes from "./api/routes/index.js";
import authRoutes from "./api/routes/authRoutes.js";
import { verifyToken } from "./api/middleware/authMiddleware.js";
import { allowRoles } from "./api/middleware/roleMiddleware.js";
import menuRoutes from "./api/routes/menuRoutes.js";
import cartRoutes from "./api/routes/cartRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

// import routes here
app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);

app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);

// protected route
app.get("/api/admin", verifyToken, allowRoles("admin"), (req, res) => {
  res.send("Welcome Admin!");
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app; // for Jest/Supertest
