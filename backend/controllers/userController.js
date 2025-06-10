const bcrypt = require("bcryptjs");
const { executeQuery } = require("../config/database");

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.search || "";
  const role = req.query.role || "";

  let whereClause = "WHERE 1=1";
  const queryParams = [];

  if (search) {
    whereClause += " AND (name LIKE ? OR email LIKE ?)";
    queryParams.push(`%${search}%`, `%${search}%`);
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

  // Get users
  const users = await executeQuery(
    `SELECT id, name, email, phone, role, created_at, updated_at 
     FROM users ${whereClause} 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [...queryParams, limit, offset]
  );

  const totalPages = Math.ceil(countResult[0].total / limit);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: countResult[0].total,
        itemsPerPage: limit,
      },
    },
  });
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin or own profile
const getUser = async (req, res) => {
  const userId = req.params.id;

  // Check if user is accessing their own profile or is admin
  if (req.user.role !== "admin" && req.user.id !== parseInt(userId)) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  const users = await executeQuery(
    "SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = ?",
    [userId]
  );

  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.json({
    success: true,
    data: users[0],
  });
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin or own profile
const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { name, email, phone, role } = req.body;

  // Check if user is updating their own profile or is admin
  if (req.user.role !== "admin" && req.user.id !== parseInt(userId)) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  // Non-admin users cannot change role
  if (req.user.role !== "admin" && role) {
    return res.status(403).json({
      success: false,
      message: "You cannot change user role",
    });
  }

  // Check if user exists
  const existingUser = await executeQuery("SELECT id FROM users WHERE id = ?", [
    userId,
  ]);

  if (existingUser.length === 0) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Check if email is already taken by another user
  if (email) {
    const emailExists = await executeQuery(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, userId]
    );

    if (emailExists.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
  }

  // Build update query
  const updates = [];
  const values = [];

  if (name) {
    updates.push("name = ?");
    values.push(name);
  }
  if (email) {
    updates.push("email = ?");
    values.push(email);
  }
  if (phone) {
    updates.push("phone = ?");
    values.push(phone);
  }
  if (role && req.user.role === "admin") {
    updates.push("role = ?");
    values.push(role);
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");
  values.push(userId);

  await executeQuery(
    `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
    values
  );

  // Get updated user
  const updatedUser = await executeQuery(
    "SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = ?",
    [userId]
  );

  res.json({
    success: true,
    message: "User updated successfully",
    data: updatedUser[0],
  });
};

// @desc    Update user password
// @route   PUT /api/users/:id/password
// @access  Private/Admin or own profile
const updatePassword = async (req, res) => {
  const userId = req.params.id;
  const { currentPassword, newPassword } = req.body;

  // Check if user is updating their own password or is admin
  if (req.user.role !== "admin" && req.user.id !== parseInt(userId)) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  // Get user with password
  const users = await executeQuery(
    "SELECT id, password FROM users WHERE id = ?",
    [userId]
  );

  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const user = users[0];

  // For non-admin users, verify current password
  if (req.user.role !== "admin") {
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  await executeQuery(
    "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [hashedPassword, userId]
  );

  res.json({
    success: true,
    message: "Password updated successfully",
  });
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  const userId = req.params.id;

  // Check if user exists
  const users = await executeQuery("SELECT id FROM users WHERE id = ?", [
    userId,
  ]);

  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Cannot delete own account
  if (req.user.id === parseInt(userId)) {
    return res.status(400).json({
      success: false,
      message: "You cannot delete your own account",
    });
  }

  // Delete user (this will cascade delete related records due to foreign key constraints)
  await executeQuery("DELETE FROM users WHERE id = ?", [userId]);

  res.json({
    success: true,
    message: "User deleted successfully",
  });
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStats = async (req, res) => {
  const stats = await executeQuery(`
    SELECT 
      COUNT(*) as total_users,
      SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
      SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END) as customer_count,
      SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_today,
      SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_this_week,
      SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_this_month
    FROM users
  `);

  res.json({
    success: true,
    data: stats[0],
  });
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  updatePassword,
  deleteUser,
  getUserStats,
};
