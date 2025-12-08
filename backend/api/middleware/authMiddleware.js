// import jwt from "jsonwebtoken";

// export const verifyToken = (req, res, next) => {
//   // Skip verification during Jest tests
//   if (process.env.NODE_ENV === "test") {
//     req.user = { _id: "dummyUserId", role: "admin" }; // Pretend admin user
//     return next();
//   }

//   const authHeader = req.headers.authorization;
//   if (!authHeader?.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "No token provided" });
//   }

//   const token = authHeader.split(" ")[1];
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // attach user info
//     next();
//   } catch {
//     res.status(403).json({ message: "Invalid or expired token" });
//   }
// };

// backend/api/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  // Skip verification during Jest tests ONLY if the test opts-in via header
  // This allows auth-rejection tests to work normally
  if (process.env.NODE_ENV === "test" && req.headers["x-test-bypass-auth"] === "true") {
    req.user = { _id: "64e0d43f9a742c3098b6a321", id: "64e0d43f9a742c3098b6a321", role: "admin" };
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Make sure both id and _id exist, no matter what payload your app uses
    const coreId = decoded.id || decoded._id;

    req.user = {
      ...decoded,
      id: coreId,
      _id: coreId,
    };

    return next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
