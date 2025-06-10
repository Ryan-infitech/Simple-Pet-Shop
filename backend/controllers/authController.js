const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { executeQuery } = require("../config/database");

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Check if user exists
  const existingUser = await executeQuery(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );

  if (existingUser.length > 0) {
    return res.status(400).json({
      success: false,
      message: "User already exists with this email",
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const result = await executeQuery(
    "INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)",
    [name, email, hashedPassword, phone, "customer"]
  );

  // Get created user
  const user = await executeQuery(
    "SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?",
    [result.insertId]
  );

  // Generate token
  const token = generateToken(user[0]);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: user[0],
      token,
    },
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  // Check user exists
  const users = await executeQuery("SELECT * FROM users WHERE email = ?", [
    email,
  ]);

  if (users.length === 0) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const user = users[0];

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Remove password from user object
  delete user.password;

  // Generate token
  const token = generateToken(user);

  res.json({
    success: true,
    message: "Login successful",
    data: {
      user,
      token,
    },
  });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  const user = await executeQuery(
    "SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = ?",
    [req.user.id]
  );

  res.json({
    success: true,
    data: user[0],
  });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Check if user exists
  const users = await executeQuery(
    "SELECT id, name, email FROM users WHERE email = ?",
    [email]
  );

  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: "User not found with this email",
    });
  }

  // TODO: Implement email sending logic here
  // For now, just return success message

  res.json({
    success: true,
    message: "Password reset instructions sent to your email",
  });
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
const refreshToken = async (req, res) => {
  const user = await executeQuery(
    "SELECT id, name, email, phone, role FROM users WHERE id = ?",
    [req.user.id]
  );

  if (user.length === 0) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const token = generateToken(user[0]);

  res.json({
    success: true,
    data: {
      token,
      user: user[0],
    },
  });
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  refreshToken,
};
