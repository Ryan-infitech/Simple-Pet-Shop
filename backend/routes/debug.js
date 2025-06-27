const express = require("express");
const { executeQuery } = require("../config/database");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

// @route   GET /api/debug/test-db
// @desc    Test database connection and simple query
// @access  Public
router.get(
  "/test-db",
  asyncHandler(async (req, res) => {
    try {
      const result = await executeQuery("SELECT 1 + 1 as test");
      res.json({
        success: true,
        message: "Database test successful",
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Database test failed",
        error: error.message,
      });
    }
  })
);

// @route   GET /api/debug/users
// @desc    Test users query
// @access  Public
router.get(
  "/users",
  asyncHandler(async (req, res) => {
    try {
      const result = await executeQuery(
        "SELECT id, email, full_name, role FROM users LIMIT 5"
      );
      res.json({
        success: true,
        message: "Users query successful",
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Users query failed",
        error: error.message,
      });
    }
  })
);

// @route   GET /api/debug/categories
// @desc    Test categories query
// @access  Public
router.get(
  "/categories",
  asyncHandler(async (req, res) => {
    try {
      const result = await executeQuery("SELECT * FROM categories LIMIT 5");
      res.json({
        success: true,
        message: "Categories query successful",
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Categories query failed",
        error: error.message,
      });
    }
  })
);

// @route   GET /api/debug/products
// @desc    Test products query
// @access  Public
router.get(
  "/products",
  asyncHandler(async (req, res) => {
    try {
      const result = await executeQuery("SELECT * FROM products LIMIT 5");
      res.json({
        success: true,
        message: "Products query successful",
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Products query failed",
        error: error.message,
      });
    }
  })
);

// @route   GET /api/debug/users
// @desc    Test users query
// @access  Public
router.get(
  "/users",
  asyncHandler(async (req, res) => {
    try {
      const result = await executeQuery("SELECT * FROM users LIMIT 5");
      res.json({
        success: true,
        message: "Users query successful",
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Users query failed",
        error: error.message,
      });
    }
  })
);

// @route   POST /api/debug/test-query
// @desc    Test any SQL query
// @access  Public
router.post(
  "/test-query",
  asyncHandler(async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({
          success: false,
          message: "Query is required",
        });
      }

      const result = await executeQuery(query);
      res.json({
        success: result.success,
        message: result.success
          ? "Query executed successfully"
          : "Query failed",
        data: result.data,
        error: result.error,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Query execution failed",
        error: error.message,
      });
    }
  })
);

module.exports = router;
