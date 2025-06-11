const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { executeQuery } = require("../config/database");
const {
  validateUserRegistration,
  validateUserLogin,
} = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your_secret_key", {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  validateUserRegistration,
  asyncHandler(async (req, res) => {
    const { full_name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await executeQuery(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.success && existingUser.data.length > 0) {
      return res.status(409).json({
        error: "User already exists",
        message: "Email is already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const result = await executeQuery(
      `INSERT INTO users (full_name, email, password, phone, role, is_active) 
     VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name, email, hashedPassword, phone, "customer", true]
    );

    if (!result.success) {
      throw new Error("Failed to create user");
    } // Get the newly created user
    const newUser = await executeQuery(
      "SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ?",
      [result.data.insertId]
    );

    if (!newUser.success || newUser.data.length === 0) {
      throw new Error("Failed to retrieve user data");
    }

    const user = newUser.data[0];

    // Generate token
    const token = generateToken(user.id);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          created_at: user.created_at,
        },
        token,
      },
    });
  })
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  validateUserLogin,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body; // Find user by email
    const result = await executeQuery(
      "SELECT id, full_name, email, password, phone, role, is_active FROM users WHERE email = ?",
      [email]
    );

    if (!result.success || result.data.length === 0) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    const user = result.data[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        error: "Account disabled",
        message: "Your account has been disabled. Please contact support.",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    // Generate token
    const token = generateToken(user.id);
    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token,
      },
    });
  })
);

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        error: "Access denied",
        message: "No token provided",
      });
    }

    try {
      // Verify current token (even if expired)
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_secret_key",
        {
          ignoreExpiration: true,
        }
      ); // Check if user still exists and is active
      const result = await executeQuery(
        "SELECT id, full_name, email, role, is_active FROM users WHERE id = ? AND is_active = true",
        [decoded.userId]
      );

      if (!result.success || result.data.length === 0) {
        return res.status(401).json({
          error: "Invalid token",
          message: "User not found or account disabled",
        });
      }

      // Generate new token
      const newToken = generateToken(decoded.userId);

      res.json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          token: newToken,
        },
      });
    } catch (error) {
      return res.status(401).json({
        error: "Invalid token",
        message: "Token verification failed",
      });
    }
  })
);

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email required",
        message: "Please provide your email address",
      });
    } // Check if user exists
    const result = await executeQuery(
      "SELECT id, email, full_name FROM users WHERE email = ? AND is_active = true",
      [email]
    );

    // Always return success for security (don't reveal if email exists)
    res.json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });

    // TODO: Implement actual email sending logic here
    if (result.success && result.data.length > 0) {
      const user = result.data[0];
      console.log(`Password reset requested for user: ${user.email}`);
      // Generate reset token and send email
    }
  })
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        error: "Access denied",
        message: "No token provided",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_secret_key"
      ); // Get user data
      const result = await executeQuery(
        "SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ? AND is_active = true",
        [decoded.userId]
      );

      if (!result.success || result.data.length === 0) {
        return res.status(401).json({
          error: "Invalid token",
          message: "User not found",
        });
      }

      const user = result.data[0];

      res.json({
        success: true,
        data: {
          user,
        },
      });
    } catch (error) {
      return res.status(401).json({
        error: "Invalid token",
        message: "Token verification failed",
      });
    }
  })
);

module.exports = router;
