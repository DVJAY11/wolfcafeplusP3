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
import adminRoutes from "./api/routes/adminRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

// Explicitly allow frontend origins (production + local dev)
const allowedOrigins = [
  "https://wrikicafe-vqm0.onrender.com", // deployed frontend
  "https://wrikicafe.onrender.com",
  "http://localhost:3000"                // local dev
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  })
);

connectDB();

app.use("/api", apiRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

// Protected route example
app.get("/api/admin", verifyToken, allowRoles("admin"), (req, res) => {
  res.send("Welcome Admin!");
});

// ---------- SOCKET.IO SETUP ----------
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export { app };
export default app;
