const { executeQuery } = require("../config/database");

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  const userId = req.user.id;

  const cartItems = await executeQuery(
    `
    SELECT 
      c.id, c.quantity, c.created_at, c.updated_at,
      p.id as product_id, p.name, p.price, p.image_url, p.stock_quantity,
      (c.quantity * p.price) as subtotal
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
  `,
    [userId]
  );

  const total = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.subtotal),
    0
  );

  res.json({
    success: true,
    data: {
      items: cartItems,
      total: total.toFixed(2),
      count: cartItems.length,
    },
  });
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  const userId = req.user.id;
  const { product_id, quantity } = req.body;

  // Check if product exists and has enough stock
  const products = await executeQuery(
    "SELECT id, name, price, stock_quantity FROM products WHERE id = ?",
    [product_id]
  );

  if (products.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const product = products[0];

  if (product.stock_quantity < quantity) {
    return res.status(400).json({
      success: false,
      message: "Insufficient stock available",
    });
  }

  // Check if item already exists in cart
  const existingItem = await executeQuery(
    "SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?",
    [userId, product_id]
  );

  if (existingItem.length > 0) {
    // Update existing item
    const newQuantity = existingItem[0].quantity + quantity;

    if (product.stock_quantity < newQuantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock available",
      });
    }

    await executeQuery(
      "UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [newQuantity, existingItem[0].id]
    );
  } else {
    // Add new item
    await executeQuery(
      "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
      [userId, product_id, quantity]
    );
  }

  res.json({
    success: true,
    message: "Item added to cart successfully",
  });
};

// @desc    Update cart item
// @route   PUT /api/cart/:id
// @access  Private
const updateCartItem = async (req, res) => {
  const userId = req.user.id;
  const itemId = req.params.id;
  const { quantity } = req.body;

  // Check if cart item exists and belongs to user
  const cartItems = await executeQuery(
    "SELECT c.id, c.product_id, p.stock_quantity FROM cart c JOIN products p ON c.product_id = p.id WHERE c.id = ? AND c.user_id = ?",
    [itemId, userId]
  );

  if (cartItems.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Cart item not found",
    });
  }

  const cartItem = cartItems[0];

  if (cartItem.stock_quantity < quantity) {
    return res.status(400).json({
      success: false,
      message: "Insufficient stock available",
    });
  }

  await executeQuery(
    "UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [quantity, itemId]
  );

  res.json({
    success: true,
    message: "Cart item updated successfully",
  });
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeFromCart = async (req, res) => {
  const userId = req.user.id;
  const itemId = req.params.id;

  // Check if cart item exists and belongs to user
  const cartItem = await executeQuery(
    "SELECT id FROM cart WHERE id = ? AND user_id = ?",
    [itemId, userId]
  );

  if (cartItem.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Cart item not found",
    });
  }

  await executeQuery("DELETE FROM cart WHERE id = ?", [itemId]);

  res.json({
    success: true,
    message: "Item removed from cart successfully",
  });
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  const userId = req.user.id;

  await executeQuery("DELETE FROM cart WHERE user_id = ?", [userId]);

  res.json({
    success: true,
    message: "Cart cleared successfully",
  });
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
