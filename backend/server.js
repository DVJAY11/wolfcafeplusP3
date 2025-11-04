import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./api/config/db.js";
import apiRoutes from "./api/routes/index.js";
import authRoutes from "./api/routes/authRoutes.js";
import { verifyToken } from "./api/middleware/authMiddleware.js";
import { allowRoles } from "./api/middleware/roleMiddleware.js";
import menuRoutes from "./api/routes/menuRoutes.js";
import cartRoutes from "./api/routes/cartRoutes.js";
import orderRoutes from "./api/routes/orderRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Protected routes
app.get("/api/admin", verifyToken, allowRoles("admin"), (req, res) => {
  res.send("Welcome Admin!");
});

// ---------- SOCKET.IO SETUP ----------
const server = http.createServer(app); 
export const io = new Server(server, {
  cors: {
    origin: "*", // or http://localhost:3000
    methods: ["GET", "POST", "PATCH", "DELETE"]
  }
});

io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 5050;

if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export { app };
export default app;
