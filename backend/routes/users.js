const express = require("express");
const bcrypt = require("bcryptjs");
const { executeQuery } = require("../config/database");
const { adminMiddleware, authMiddleware } = require("../middleware/auth");
const { uploadSingle } = require("../middleware/upload");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get(
  "/",
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    const role = req.query.role || "";

    let whereClause = "WHERE 1=1";
    const queryParams = [];

    if (search) {
      whereClause +=
        " AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR username LIKE ?)";
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (role) {
      whereClause += " AND role = ?";
      queryParams.push(role);
    }

    // Get total count
    const countResult = await executeQuery(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      queryParams
    );

    const total = countResult.success ? countResult.data[0].total : 0;

    // Get users
    const result = await executeQuery(
      `SELECT id, username, email, first_name, last_name, phone, role, avatar, is_active, created_at, updated_at 
     FROM users ${whereClause} 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    if (!result.success) {
      throw new Error("Failed to fetch users");
    }

    res.json({
      success: true,
      data: {
        users: result.data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  })
);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (own profile) or Admin
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);

    // Check if user is accessing their own profile or is admin
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        error: "Access denied",
        message: "You can only access your own profile",
      });
    }
    const result = await executeQuery(
      "SELECT id, full_name, email, phone, role, is_active, created_at, updated_at FROM users WHERE id = ?",
      [userId]
    );

    if (!result.success || result.data.length === 0) {
      return res.status(404).json({
        error: "User not found",
        message: "User with this ID does not exist",
      });
    }

    res.json({
      success: true,
      data: {
        user: result.data[0],
      },
    });
  })
);

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private (own profile) or Admin
router.put(
  "/:id",
  uploadSingle("avatar"),
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);

    // Check if user is updating their own profile or is admin
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        error: "Access denied",
        message: "You can only update your own profile",
      });
    }

    const { first_name, last_name, phone, address } = req.body;
    const updateData = {};
    const queryParams = [];
    let query = "UPDATE users SET ";
    const updateFields = [];

    if (first_name) {
      updateFields.push("first_name = ?");
      queryParams.push(first_name);
    }

    if (last_name) {
      updateFields.push("last_name = ?");
      queryParams.push(last_name);
    }

    if (phone) {
      updateFields.push("phone = ?");
      queryParams.push(phone);
    }

    if (address) {
      updateFields.push("address = ?");
      queryParams.push(address);
    }

    if (req.file) {
      updateFields.push("avatar = ?");
      queryParams.push(`/uploads/avatars/${req.file.filename}`);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: "No data to update",
        message: "Please provide at least one field to update",
      });
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    query += updateFields.join(", ") + " WHERE id = ?";
    queryParams.push(userId);

    const result = await executeQuery(query, queryParams);

    if (!result.success) {
      throw new Error("Failed to update user profile");
    }

    // Get updated user data
    const updatedUser = await executeQuery(
      "SELECT id, username, email, first_name, last_name, phone, role, avatar, address, updated_at FROM users WHERE id = ?",
      [userId]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser.data[0],
      },
    });
  })
);

// @route   PUT /api/users/:id/password
// @desc    Change user password
// @access  Private (own profile) or Admin
router.put(
  "/:id/password",
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);
    const { current_password, new_password } = req.body;

    // Check if user is updating their own password or is admin
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        error: "Access denied",
        message: "You can only change your own password",
      });
    }

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({
        error: "Invalid password",
        message: "New password must be at least 6 characters long",
      });
    }

    // If not admin, verify current password
    if (req.user.role !== "admin") {
      if (!current_password) {
        return res.status(400).json({
          error: "Current password required",
          message: "Please provide your current password",
        });
      }

      // Get current password hash
      const userResult = await executeQuery(
        "SELECT password FROM users WHERE id = ?",
        [userId]
      );

      if (!userResult.success || userResult.data.length === 0) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        current_password,
        userResult.data[0].password
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          error: "Invalid current password",
          message: "Current password is incorrect",
        });
      }
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(new_password, 12);

    // Update password
    const result = await executeQuery(
      "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [hashedNewPassword, userId]
    );

    if (!result.success) {
      throw new Error("Failed to update password");
    }

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  })
);

// @route   PUT /api/users/:id/status
// @desc    Toggle user active status (admin only)
// @access  Private/Admin
router.put(
  "/:id/status",
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);
    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        error: "Invalid status",
        message: "is_active must be a boolean value",
      });
    }

    const result = await executeQuery(
      "UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [is_active, userId]
    );

    if (!result.success) {
      throw new Error("Failed to update user status");
    }

    if (result.data.affectedRows === 0) {
      return res.status(404).json({
        error: "User not found",
        message: "User with this ID does not exist",
      });
    }

    res.json({
      success: true,
      message: `User ${is_active ? "activated" : "deactivated"} successfully`,
    });
  })
);

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete(
  "/:id",
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);

    // Check if user exists
    const userExists = await executeQuery("SELECT id FROM users WHERE id = ?", [
      userId,
    ]);

    if (!userExists.success || userExists.data.length === 0) {
      return res.status(404).json({
        error: "User not found",
        message: "User with this ID does not exist",
      });
    }

    // Delete user
    const result = await executeQuery("DELETE FROM users WHERE id = ?", [
      userId,
    ]);

    if (!result.success) {
      throw new Error("Failed to delete user");
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  })
);

// @route   GET /api/users/:id/orders
// @desc    Get user's orders
// @access  Private (own orders) or Admin
router.get(
  "/:id/orders",
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);

    // Check if user is accessing their own orders or is admin
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        error: "Access denied",
        message: "You can only access your own orders",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await executeQuery(
      "SELECT COUNT(*) as total FROM orders WHERE user_id = ?",
      [userId]
    );

    const total = countResult.success ? countResult.data[0].total : 0;

    // Get orders
    const result = await executeQuery(
      `SELECT o.*, COUNT(oi.id) as item_count
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     WHERE o.user_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    if (!result.success) {
      throw new Error("Failed to fetch orders");
    }

    res.json({
      success: true,
      data: {
        orders: result.data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  })
);

module.exports = router;
