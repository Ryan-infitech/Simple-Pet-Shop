const express = require("express");
const { executeQuery } = require("../config/database");
const { adminMiddleware } = require("../middleware/auth");
const { uploadSingle } = require("../middleware/upload");
const { validateCategory } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const includeProducts = req.query.include_products === "true";
    let query = `
    SELECT c.*,
    (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
    FROM categories c 
    ORDER BY c.name ASC
  `;

    const result = await executeQuery(query);

    if (!result.success) {
      throw new Error("Failed to fetch categories");
    }

    let categories = result.data;

    // If include_products is true, fetch products for each category
    if (includeProducts) {
      for (let category of categories) {
        const productsResult = await executeQuery(
          `SELECT id, name, price, image_url, stock_quantity,
         (SELECT AVG(rating) FROM product_reviews r WHERE r.product_id = p.id) as avg_rating
         FROM products p 
         WHERE p.category_id = ? AND p.is_active = true 
         ORDER BY p.created_at DESC 
         LIMIT 8`,
          [category.id]
        );

        if (productsResult.success) {
          category.products = productsResult.data;
        } else {
          category.products = [];
        }
      }
    }

    res.json({
      success: true,
      data: {
        categories,
      },
    });
  })
);

// @route   GET /api/categories/:id
// @desc    Get single category by ID
// @access  Public
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const categoryId = parseInt(req.params.id);

    const result = await executeQuery(
      `SELECT c.*,
     (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = true) as product_count
     FROM categories c 
     WHERE c.id = ? AND c.is_active = true`,
      [categoryId]
    );

    if (!result.success || result.data.length === 0) {
      return res.status(404).json({
        error: "Category not found",
        message: "Category with this ID does not exist or is not active",
      });
    }

    const category = result.data[0];

    // Get products in this category
    const productsResult = await executeQuery(
      `SELECT p.*, 
     (SELECT AVG(rating) FROM reviews r WHERE r.product_id = p.id) as avg_rating,
     (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) as review_count
     FROM products p 
     WHERE p.category_id = ? AND p.is_active = true 
     ORDER BY p.is_featured DESC, p.created_at DESC`,
      [categoryId]
    );

    if (productsResult.success) {
      category.products = productsResult.data;
    } else {
      category.products = [];
    }

    res.json({
      success: true,
      data: {
        category,
      },
    });
  })
);

// @route   POST /api/categories
// @desc    Create new category (admin only)
// @access  Private/Admin
router.post(
  "/",
  adminMiddleware,
  uploadSingle("category_image"),
  validateCategory,
  asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    // Check if category name already exists
    const existingCategory = await executeQuery(
      "SELECT id FROM categories WHERE name = ?",
      [name]
    );

    if (existingCategory.success && existingCategory.data.length > 0) {
      return res.status(409).json({
        error: "Category already exists",
        message: "A category with this name already exists",
      });
    }

    let image = null;
    if (req.file) {
      image = `/uploads/categories/${req.file.filename}`;
    }

    const result = await executeQuery(
      "INSERT INTO categories (name, description, image) VALUES (?, ?, ?)",
      [name, description, image]
    );

    if (!result.success) {
      throw new Error("Failed to create category");
    }

    // Get the created category
    const newCategory = await executeQuery(
      "SELECT * FROM categories WHERE id = ?",
      [result.data.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: {
        category: newCategory.data[0],
      },
    });
  })
);

// @route   PUT /api/categories/:id
// @desc    Update category (admin only)
// @access  Private/Admin
router.put(
  "/:id",
  adminMiddleware,
  uploadSingle("category_image"),
  asyncHandler(async (req, res) => {
    const categoryId = parseInt(req.params.id);
    const { name, description } = req.body;

    // Check if category exists
    const categoryExists = await executeQuery(
      "SELECT id FROM categories WHERE id = ?",
      [categoryId]
    );

    if (!categoryExists.success || categoryExists.data.length === 0) {
      return res.status(404).json({
        error: "Category not found",
        message: "Category with this ID does not exist",
      });
    }

    // Check if new name conflicts with existing category (if name is being changed)
    if (name) {
      const nameConflict = await executeQuery(
        "SELECT id FROM categories WHERE name = ? AND id != ?",
        [name, categoryId]
      );

      if (nameConflict.success && nameConflict.data.length > 0) {
        return res.status(409).json({
          error: "Category name conflict",
          message: "A category with this name already exists",
        });
      }
    }

    const updateFields = [];
    const queryParams = [];

    if (name) {
      updateFields.push("name = ?");
      queryParams.push(name);
    }

    if (description !== undefined) {
      updateFields.push("description = ?");
      queryParams.push(description);
    }

    if (req.file) {
      updateFields.push("image = ?");
      queryParams.push(`/uploads/categories/${req.file.filename}`);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: "No data to update",
        message: "Please provide at least one field to update",
      });
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    const query = `UPDATE categories SET ${updateFields.join(
      ", "
    )} WHERE id = ?`;
    queryParams.push(categoryId);

    const result = await executeQuery(query, queryParams);

    if (!result.success) {
      throw new Error("Failed to update category");
    }

    // Get updated category
    const updatedCategory = await executeQuery(
      "SELECT * FROM categories WHERE id = ?",
      [categoryId]
    );

    res.json({
      success: true,
      message: "Category updated successfully",
      data: {
        category: updatedCategory.data[0],
      },
    });
  })
);

// @route   DELETE /api/categories/:id
// @desc    Delete category (admin only)
// @access  Private/Admin
router.delete(
  "/:id",
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const categoryId = parseInt(req.params.id);

    // Check if category exists
    const categoryExists = await executeQuery(
      "SELECT id FROM categories WHERE id = ?",
      [categoryId]
    );

    if (!categoryExists.success || categoryExists.data.length === 0) {
      return res.status(404).json({
        error: "Category not found",
        message: "Category with this ID does not exist",
      });
    }

    // Check if category has products
    const hasProducts = await executeQuery(
      "SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_active = true",
      [categoryId]
    );

    if (hasProducts.success && hasProducts.data[0].count > 0) {
      return res.status(400).json({
        error: "Cannot delete category",
        message:
          "Category has active products. Please move or delete the products first.",
      });
    }

    // Soft delete - mark as inactive
    const result = await executeQuery(
      "UPDATE categories SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [categoryId]
    );

    if (!result.success) {
      throw new Error("Failed to delete category");
    }

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  })
);

// @route   PUT /api/categories/:id/status
// @desc    Toggle category active status (admin only)
// @access  Private/Admin
router.put(
  "/:id/status",
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const categoryId = parseInt(req.params.id);
    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        error: "Invalid status",
        message: "is_active must be a boolean value",
      });
    }

    const result = await executeQuery(
      "UPDATE categories SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [is_active, categoryId]
    );

    if (!result.success) {
      throw new Error("Failed to update category status");
    }

    if (result.data.affectedRows === 0) {
      return res.status(404).json({
        error: "Category not found",
        message: "Category with this ID does not exist",
      });
    }

    res.json({
      success: true,
      message: `Category ${
        is_active ? "activated" : "deactivated"
      } successfully`,
    });
  })
);

// @route   GET /api/categories/:id/products
// @desc    Get products in a category with pagination
// @access  Public
router.get(
  "/:id/products",
  asyncHandler(async (req, res) => {
    const categoryId = parseInt(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const sortBy = req.query.sort_by || "created_at";
    const sortOrder = req.query.sort_order || "DESC";

    // Verify category exists
    const categoryExists = await executeQuery(
      "SELECT id, name FROM categories WHERE id = ? AND is_active = true",
      [categoryId]
    );

    if (!categoryExists.success || categoryExists.data.length === 0) {
      return res.status(404).json({
        error: "Category not found",
        message: "Category with this ID does not exist or is not active",
      });
    }

    // Validate sort parameters
    const allowedSortFields = ["name", "price", "created_at", "stock_quantity"];
    const allowedSortOrders = ["ASC", "DESC"];

    const validSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "created_at";
    const validSortOrder = allowedSortOrders.includes(sortOrder.toUpperCase())
      ? sortOrder.toUpperCase()
      : "DESC";

    // Get total count
    const countResult = await executeQuery(
      "SELECT COUNT(*) as total FROM products WHERE category_id = ? AND is_active = true",
      [categoryId]
    );

    const total = countResult.success ? countResult.data[0].total : 0;

    // Get products
    const result = await executeQuery(
      `SELECT p.*,
     (SELECT AVG(rating) FROM reviews r WHERE r.product_id = p.id) as avg_rating,
     (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) as review_count
     FROM products p 
     WHERE p.category_id = ? AND p.is_active = true
     ORDER BY p.${validSortBy} ${validSortOrder}
     LIMIT ? OFFSET ?`,
      [categoryId, limit, offset]
    );

    if (!result.success) {
      throw new Error("Failed to fetch products");
    }

    res.json({
      success: true,
      data: {
        category: categoryExists.data[0],
        products: result.data,
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
