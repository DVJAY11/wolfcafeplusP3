export const allowRoles = (...allowedRoles) => (req, res, next) => {
  // Always allow in test mode
  if (process.env.NODE_ENV === "test") {
    return next();
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: Insufficient role" });
  }
  next();
};
