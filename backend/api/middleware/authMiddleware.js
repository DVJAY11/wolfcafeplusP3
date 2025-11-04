// backend/api/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "testsecret");
    req.user = decoded; // attach user info (role comes from token)
    next();
  } catch {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
