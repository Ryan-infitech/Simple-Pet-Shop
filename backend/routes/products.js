const express = require("express");
const { executeQuery } = require("../config/database");
const {
  authMiddleware,
  adminMiddleware,
  optionalAuth,
} = require("../middleware/auth");
const { uploadMultiple } = require("../middleware/upload");
const { validateProduct } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const minPrice = parseFloat(req.query.min_price) || 0;
    const maxPrice = parseFloat(req.query.max_price) || 999999;
    const sortBy = req.query.sort_by || "created_at";
    const sortOrder = req.query.sort_order || "DESC";
    const featured = req.query.featured === "true";

    let whereClause = "WHERE p.is_active = true";
    const queryParams = [];

    if (search) {
      whereClause +=
        " AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)";
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      whereClause += " AND p.category_id = ?";
      queryParams.push(category);
    }

    if (minPrice > 0) {
      whereClause += " AND p.price >= ?";
      queryParams.push(minPrice);
    }

    if (maxPrice < 999999) {
      whereClause += " AND p.price <= ?";
      queryParams.push(maxPrice);
    }

    if (featured) {
      whereClause += " AND p.is_featured = true";
    }

    // Validate sort parameters
    const allowedSortFields = ["name", "price", "created_at", "stock_quantity"];
    const allowedSortOrders = ["ASC", "DESC"];

    const validSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "created_at";
    const validSortOrder = allowedSortOrders.includes(sortOrder.toUpperCase())
      ? sortOrder.toUpperCase()
      : "DESC"; // Get total count
    const countResult = await executeQuery(
      `SELECT COUNT(*) as total 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     ${whereClause}`,
      queryParams
    );
    const total = countResult.success ? countResult.data[0].total : 0; // Get products
    const result = await executeQuery(
      `SELECT p.*, c.name as category_name,
     0 as avg_rating,
     0 as review_count
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     ${whereClause}
     ORDER BY p.${validSortBy} ${validSortOrder}, p.id ASC
     LIMIT ${limit} OFFSET ${offset}`,
      [...queryParams]
    );

    if (!result.success) {
      throw new Error("Failed to fetch products");
    }

    // Add wishlist status if user is authenticated
    let products = result.data;
    if (req.user) {
      const productIds = products.map((p) => p.id);
      if (productIds.length > 0) {
        const wishlistResult = await executeQuery(
          `SELECT product_id FROM wishlist WHERE user_id = ? AND product_id IN (${productIds
            .map(() => "?")
            .join(",")})`,
          [req.user.id, ...productIds]
        );

        if (wishlistResult.success) {
          const wishlistProductIds = new Set(
            wishlistResult.data.map((w) => w.product_id)
          );
          products = products.map((product) => ({
            ...product,
            is_in_wishlist: wishlistProductIds.has(product.id),
          }));
        }
      }
    }

    res.json({
      success: true,
      data: {
        products,
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

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get(
  "/featured",
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 8;

    const result = await executeQuery(
      `SELECT p.*, c.name as category_name,
     0 as avg_rating,
     0 as review_count
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.is_active = true AND p.is_featured = true
     ORDER BY p.created_at DESC
     LIMIT ?`,
      [limit]
    );

    if (!result.success) {
      throw new Error("Failed to fetch featured products");
    }

    res.json({
      success: true,
      data: {
        products: result.data,
      },
    });
  })
);

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const productId = parseInt(req.params.id);

    const result = await executeQuery(
      `SELECT p.*, c.name as category_name,
     0 as avg_rating,
     0 as review_count
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.id = ? AND p.is_active = true`,
      [productId]
    );

    if (!result.success || result.data.length === 0) {
      return res.status(404).json({
        error: "Product not found",
        message: "Product with this ID does not exist or is not active",
      });
    }

    let product = result.data[0];

    // Check if product is in user's wishlist
    if (req.user) {
      const wishlistResult = await executeQuery(
        "SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?",
        [req.user.id, productId]
      );

      product.is_in_wishlist =
        wishlistResult.success && wishlistResult.data.length > 0;
    }

    // Set empty reviews array since reviews table doesn't exist
    product.recent_reviews = [];

    res.json({
      success: true,
      data: {
        product,
      },
    });
  })
);

// @route   POST /api/products
// @desc    Create new product (admin only)
// @access  Private/Admin
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  uploadMultiple("product_images", 5),
  validateProduct,
  asyncHandler(async (req, res) => {
    const { name, description, price, stock_quantity, category_id } = req.body;

    // Handle uploaded images
    let image_url = null;

    if (req.files && req.files.length > 0) {
      const images = req.files.map(
        (file) => `/uploads/products/${file.filename}`
      );
      image_url = images[0]; // First image as main image
    }

    const result = await executeQuery(
      `INSERT INTO products (name, description, price, stock_quantity, category_id, image_url)
     VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, price, stock_quantity, category_id, image_url]
    );

    if (!result.success) {
      throw new Error("Failed to create product");
    }

    // Get the created product
    const newProduct = await executeQuery(
      `SELECT p.*, c.name as category_name 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.id = ?`,
      [result.data.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: {
        product: newProduct.data[0],
      },
    });
  })
);

// @route   PUT /api/products/:id
// @desc    Update product (admin only)
// @access  Private/Admin
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  uploadMultiple("product_images", 5),
  asyncHandler(async (req, res) => {
    const productId = parseInt(req.params.id);
    const {
      name,
      description,
      price,
      stock_quantity,
      category_id,
      weight,
      dimensions,
      brand,
      sku,
      is_featured,
      discount_percentage,
    } = req.body; // Check if product exists
    const productExists = await executeQuery(
      "SELECT id FROM products WHERE id = ?",
      [productId]
    );

    if (!productExists.success || productExists.data.length === 0) {
      return res.status(404).json({
        error: "Product not found",
        message: "Product with this ID does not exist",
      });
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

    if (price) {
      updateFields.push("price = ?");
      queryParams.push(price);
    }

    if (stock_quantity !== undefined) {
      updateFields.push("stock_quantity = ?");
      queryParams.push(stock_quantity);
    }

    if (category_id) {
      updateFields.push("category_id = ?");
      queryParams.push(category_id);
    }

    // Handle new images if uploaded
    if (req.files && req.files.length > 0) {
      const images = req.files.map(
        (file) => `/uploads/products/${file.filename}`
      );
      updateFields.push("image_url = ?");
      queryParams.push(images[0]); // Use first image as main image
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: "No data to update",
        message: "Please provide at least one field to update",
      });
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    const query = `UPDATE products SET ${updateFields.join(", ")} WHERE id = ?`;
    queryParams.push(productId);

    const result = await executeQuery(query, queryParams);

    if (!result.success) {
      throw new Error("Failed to update product");
    }

    // Get updated product
    const updatedProduct = await executeQuery(
      `SELECT p.*, c.name as category_name 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.id = ?`,
      [productId]
    );

    res.json({
      success: true,
      message: "Product updated successfully",
      data: {
        product: updatedProduct.data[0],
      },
    });
  })
);

// @route   DELETE /api/products/:id
// @desc    Delete product (admin only)
// @access  Private/Admin
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const productId = parseInt(req.params.id);

    // Check if product exists
    const productExists = await executeQuery(
      "SELECT id FROM products WHERE id = ?",
      [productId]
    );

    if (!productExists.success || productExists.data.length === 0) {
      return res.status(404).json({
        error: "Product not found",
        message: "Product with this ID does not exist",
      });
    }

    // Soft delete - just mark as inactive
    const result = await executeQuery(
      "UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [productId]
    );

    if (!result.success) {
      throw new Error("Failed to delete product");
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  })
);

module.exports = router;
