const jwt = require("jsonwebtoken");
const { executeQuery } = require("../config/database");

// Middleware to verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        error: "Access denied",
        message: "No token provided",
      });
      } // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_secret_key"
    );

    // Get user from database
    const result = await executeQuery(
      "SELECT id, full_name, email, role, is_active FROM users WHERE id = ? AND is_active = true",
      [decoded.userId]
    );

    if (!result.success || result.data.length === 0) {
      return res.status(401).json({
        error: "Access denied",
        message: "Invalid token or user not found",
      });
    }

    // Add user to request object
    req.user = result.data[0];
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Access denied",
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Access denied",
        message: "Token expired",
      });
    }

    console.error("Auth middleware error:", error);
    res.status(500).json({
      error: "Server error",
      message: "Authentication failed",
    });
  }
};

// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Access denied",
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Access denied",
      message: "Admin privileges required",
    });
  }

  next();
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      req.user = null;
      return next();
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_secret_key"
    ); // Get user from database
    const result = await executeQuery(
      "SELECT id, full_name, email, role, is_active FROM users WHERE id = ? AND is_active = true",
      [decoded.userId]
    );

    if (result.success && result.data.length > 0) {
      req.user = result.data[0];
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // If token is invalid, just set user to null and continue
    req.user = null;
    next();
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  optionalAuth,
};
