const { executeQuery } = require("../config/database");

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  const categories = await executeQuery(`
    SELECT 
      c.id, c.name, c.description, c.created_at, c.updated_at,
      COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
    GROUP BY c.id, c.name, c.description, c.created_at, c.updated_at
    ORDER BY c.name ASC
  `);

  res.json({
    success: true,
    data: categories,
  });
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategory = async (req, res) => {
  const categoryId = req.params.id;

  const categories = await executeQuery(
    "SELECT id, name, description, created_at, updated_at FROM categories WHERE id = ?",
    [categoryId]
  );

  if (categories.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  res.json({
    success: true,
    data: categories[0],
  });
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  const { name, description } = req.body;

  // Check if category name already exists
  const existingCategory = await executeQuery(
    "SELECT id FROM categories WHERE name = ?",
    [name]
  );

  if (existingCategory.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Category name already exists",
    });
  }

  const result = await executeQuery(
    "INSERT INTO categories (name, description) VALUES (?, ?)",
    [name, description]
  );

  // Get created category
  const category = await executeQuery(
    "SELECT id, name, description, created_at, updated_at FROM categories WHERE id = ?",
    [result.insertId]
  );

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category[0],
  });
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  const categoryId = req.params.id;
  const { name, description } = req.body;

  // Check if category exists
  const existingCategory = await executeQuery(
    "SELECT id FROM categories WHERE id = ?",
    [categoryId]
  );

  if (existingCategory.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  // Check if name is taken by another category
  if (name) {
    const nameExists = await executeQuery(
      "SELECT id FROM categories WHERE name = ? AND id != ?",
      [name, categoryId]
    );

    if (nameExists.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Category name already exists",
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
  if (description !== undefined) {
    updates.push("description = ?");
    values.push(description);
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");
  values.push(categoryId);

  await executeQuery(
    `UPDATE categories SET ${updates.join(", ")} WHERE id = ?`,
    values
  );

  // Get updated category
  const updatedCategory = await executeQuery(
    "SELECT id, name, description, created_at, updated_at FROM categories WHERE id = ?",
    [categoryId]
  );

  res.json({
    success: true,
    message: "Category updated successfully",
    data: updatedCategory[0],
  });
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  const categoryId = req.params.id;

  // Check if category exists
  const category = await executeQuery(
    "SELECT id FROM categories WHERE id = ?",
    [categoryId]
  );

  if (category.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  // Check if category has products
  const products = await executeQuery(
    "SELECT COUNT(*) as count FROM products WHERE category_id = ?",
    [categoryId]
  );

  if (products[0].count > 0) {
    return res.status(400).json({
      success: false,
      message:
        "Cannot delete category that has products. Please move or delete products first.",
    });
  }

  // Delete category
  await executeQuery("DELETE FROM categories WHERE id = ?", [categoryId]);

  res.json({
    success: true,
    message: "Category deleted successfully",
  });
};

// @desc    Get category products
// @route   GET /api/categories/:id/products
// @access  Public
const getCategoryProducts = async (req, res) => {
  const categoryId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;

  // Check if category exists
  const category = await executeQuery(
    "SELECT id, name FROM categories WHERE id = ?",
    [categoryId]
  );

  if (category.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  // Get total count
  const countResult = await executeQuery(
    "SELECT COUNT(*) as total FROM products WHERE category_id = ?",
    [categoryId]
  );

  // Get products
  const products = await executeQuery(
    `SELECT 
       id, name, description, price, stock_quantity, 
       image_url, is_featured, created_at, updated_at
     FROM products 
     WHERE category_id = ?
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [categoryId, limit, offset]
  );

  const totalPages = Math.ceil(countResult[0].total / limit);

  res.json({
    success: true,
    data: {
      category: category[0],
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: countResult[0].total,
        itemsPerPage: limit,
      },
    },
  });
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
};
