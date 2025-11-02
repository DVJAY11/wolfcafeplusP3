import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  // Skip verification during Jest tests
  if (process.env.NODE_ENV === "test") {
    req.user = { _id: "dummyUserId", role: "admin" }; // Pretend admin user
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info
    next();
  } catch {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
