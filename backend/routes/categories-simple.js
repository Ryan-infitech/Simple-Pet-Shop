const express = require("express");
const { executeQuery } = require("../config/database");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories (simplified version)
// @access  Public
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const result = await executeQuery(
      "SELECT * FROM categories ORDER BY name ASC"
    );

    if (!result.success) {
      throw new Error("Failed to fetch categories");
    }

    res.json({
      success: true,
      data: result.data,
    });
  })
);

// @route   GET /api/categories/:id
// @desc    Get single category
// @access  Public
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const categoryId = req.params.id;

    const result = await executeQuery("SELECT * FROM categories WHERE id = ?", [
      categoryId,
    ]);

    if (!result.success || result.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: result.data[0],
    });
  })
);

module.exports = router;
