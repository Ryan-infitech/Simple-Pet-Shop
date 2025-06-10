const { executeQuery } = require("../config/database");
const path = require("path");
const fs = require("fs").promises;

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;
  const search = req.query.search || "";
  const category = req.query.category || "";
  const minPrice = req.query.min_price || "";
  const maxPrice = req.query.max_price || "";
  const sortBy = req.query.sort_by || "created_at";
  const sortOrder = req.query.sort_order || "DESC";

  let whereClause = "WHERE 1=1";
  const queryParams = [];

  if (search) {
    whereClause += " AND (p.name LIKE ? OR p.description LIKE ?)";
    queryParams.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    whereClause += " AND p.category_id = ?";
    queryParams.push(category);
  }

  if (minPrice) {
    whereClause += " AND p.price >= ?";
    queryParams.push(minPrice);
  }

  if (maxPrice) {
    whereClause += " AND p.price <= ?";
    queryParams.push(maxPrice);
  }

  // Get total count
  const countResult = await executeQuery(
    `SELECT COUNT(*) as total 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     ${whereClause}`,
    queryParams
  );

  // Get products
  const products = await executeQuery(
    `SELECT 
       p.id, p.name, p.description, p.price, p.stock_quantity, 
       p.image_url, p.is_featured, p.created_at, p.updated_at,
       c.name as category_name, c.id as category_id
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     ${whereClause}
     ORDER BY p.${sortBy} ${sortOrder}
     LIMIT ? OFFSET ?`,
    [...queryParams, limit, offset]
  );

  const totalPages = Math.ceil(countResult[0].total / limit);

  res.json({
    success: true,
    data: {
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

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res) => {
  const productId = req.params.id;

  const products = await executeQuery(
    `SELECT 
       p.id, p.name, p.description, p.price, p.stock_quantity, 
       p.image_url, p.is_featured, p.created_at, p.updated_at,
       c.name as category_name, c.id as category_id
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.id = ?`,
    [productId]
  );

  if (products.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  res.json({
    success: true,
    data: products[0],
  });
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const { name, description, price, stock_quantity, category_id, is_featured } =
    req.body;
  let image_url = null;

  // Handle image upload
  if (req.file) {
    image_url = `/uploads/products/${req.file.filename}`;
  }

  // Check if category exists
  if (category_id) {
    const category = await executeQuery(
      "SELECT id FROM categories WHERE id = ?",
      [category_id]
    );

    if (category.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }
  }

  const result = await executeQuery(
    `INSERT INTO products (name, description, price, stock_quantity, category_id, image_url, is_featured) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      description,
      price,
      stock_quantity,
      category_id,
      image_url,
      is_featured || false,
    ]
  );

  // Get created product
  const product = await executeQuery(
    `SELECT 
       p.id, p.name, p.description, p.price, p.stock_quantity, 
       p.image_url, p.is_featured, p.created_at, p.updated_at,
       c.name as category_name, c.id as category_id
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.id = ?`,
    [result.insertId]
  );

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product[0],
  });
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const productId = req.params.id;
  const { name, description, price, stock_quantity, category_id, is_featured } =
    req.body;

  // Check if product exists
  const existingProduct = await executeQuery(
    "SELECT id, image_url FROM products WHERE id = ?",
    [productId]
  );

  if (existingProduct.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  // Check if category exists
  if (category_id) {
    const category = await executeQuery(
      "SELECT id FROM categories WHERE id = ?",
      [category_id]
    );

    if (category.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }
  }

  let image_url = existingProduct[0].image_url;

  // Handle image upload
  if (req.file) {
    // Delete old image if exists
    if (existingProduct[0].image_url) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        existingProduct[0].image_url
      );
      try {
        await fs.unlink(oldImagePath);
      } catch (error) {
        console.log("Error deleting old image:", error.message);
      }
    }

    image_url = `/uploads/products/${req.file.filename}`;
  }

  // Build update query
  const updates = [];
  const values = [];

  if (name !== undefined) {
    updates.push("name = ?");
    values.push(name);
  }
  if (description !== undefined) {
    updates.push("description = ?");
    values.push(description);
  }
  if (price !== undefined) {
    updates.push("price = ?");
    values.push(price);
  }
  if (stock_quantity !== undefined) {
    updates.push("stock_quantity = ?");
    values.push(stock_quantity);
  }
  if (category_id !== undefined) {
    updates.push("category_id = ?");
    values.push(category_id);
  }
  if (is_featured !== undefined) {
    updates.push("is_featured = ?");
    values.push(is_featured);
  }
  if (image_url !== existingProduct[0].image_url) {
    updates.push("image_url = ?");
    values.push(image_url);
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");
  values.push(productId);

  await executeQuery(
    `UPDATE products SET ${updates.join(", ")} WHERE id = ?`,
    values
  );

  // Get updated product
  const updatedProduct = await executeQuery(
    `SELECT 
       p.id, p.name, p.description, p.price, p.stock_quantity, 
       p.image_url, p.is_featured, p.created_at, p.updated_at,
       c.name as category_name, c.id as category_id
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.id = ?`,
    [productId]
  );

  res.json({
    success: true,
    message: "Product updated successfully",
    data: updatedProduct[0],
  });
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  const productId = req.params.id;

  // Check if product exists
  const product = await executeQuery(
    "SELECT id, image_url FROM products WHERE id = ?",
    [productId]
  );

  if (product.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  // Delete image file if exists
  if (product[0].image_url) {
    const imagePath = path.join(__dirname, "..", product[0].image_url);
    try {
      await fs.unlink(imagePath);
    } catch (error) {
      console.log("Error deleting image:", error.message);
    }
  }

  // Delete product
  await executeQuery("DELETE FROM products WHERE id = ?", [productId]);

  res.json({
    success: true,
    message: "Product deleted successfully",
  });
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;

  const products = await executeQuery(
    `SELECT 
       p.id, p.name, p.description, p.price, p.stock_quantity, 
       p.image_url, p.is_featured, p.created_at, p.updated_at,
       c.name as category_name, c.id as category_id
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.is_featured = true 
     ORDER BY p.created_at DESC 
     LIMIT ?`,
    [limit]
  );

  res.json({
    success: true,
    data: products,
  });
};

// @desc    Get product statistics
// @route   GET /api/products/stats
// @access  Private/Admin
const getProductStats = async (req, res) => {
  const stats = await executeQuery(`
    SELECT 
      COUNT(*) as total_products,
      SUM(stock_quantity) as total_stock,
      AVG(price) as average_price,
      SUM(CASE WHEN is_featured = true THEN 1 ELSE 0 END) as featured_products,
      SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
      SUM(CASE WHEN stock_quantity <= 10 THEN 1 ELSE 0 END) as low_stock
    FROM products
  `);

  res.json({
    success: true,
    data: stats[0],
  });
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductStats,
};
