const express = require("express");
const { executeQuery } = require("../config/database");
const { validateCartItem } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

// @route   GET /api/cart
// @desc    Get user's cart items
// @access  Private
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const result = await executeQuery(
      `SELECT c.*, p.name, p.price, p.image_url as image, p.stock_quantity, p.is_active,
     (p.price * c.quantity) as subtotal
     FROM cart c
     JOIN products p ON c.product_id = p.id
     WHERE c.user_id = ?
     ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    if (!result.success) {
      throw new Error("Failed to fetch cart items");
    } // Calculate totals
    const cartItems = result.data;
    let totalItems = 0;
    let totalAmount = 0;

    cartItems.forEach((item) => {
      totalItems += item.quantity;
      totalAmount += parseFloat(item.subtotal);
    });

    res.json({
      success: true,
      data: {
        cart_items: cartItems,
        summary: {
          total_items: totalItems,
          total_amount: totalAmount,
        },
      },
    });
  })
);

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post(
  "/",
  validateCartItem,
  asyncHandler(async (req, res) => {
    const { product_id, quantity } = req.body;

    // Check if product exists and is active
    const productResult = await executeQuery(
      "SELECT id, name, price, stock_quantity, is_active FROM products WHERE id = ?",
      [product_id]
    );

    if (!productResult.success || productResult.data.length === 0) {
      return res.status(404).json({
        error: "Product not found",
        message: "Product with this ID does not exist",
      });
    }

    const product = productResult.data[0];

    if (!product.is_active) {
      return res.status(400).json({
        error: "Product unavailable",
        message: "This product is currently not available",
      });
    }

    if (product.stock_quantity < quantity) {
      return res.status(400).json({
        error: "Insufficient stock",
        message: `Only ${product.stock_quantity} items available in stock`,
      });
    }

    // Check if item already exists in cart
    const existingItem = await executeQuery(
      "SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?",
      [req.user.id, product_id]
    );

    if (existingItem.success && existingItem.data.length > 0) {
      // Update existing item
      const newQuantity = existingItem.data[0].quantity + quantity;

      if (product.stock_quantity < newQuantity) {
        return res.status(400).json({
          error: "Insufficient stock",
          message: `Only ${product.stock_quantity} items available in stock`,
        });
      }

      const updateResult = await executeQuery(
        "UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [newQuantity, existingItem.data[0].id]
      );

      if (!updateResult.success) {
        throw new Error("Failed to update cart item");
      }

      res.json({
        success: true,
        message: "Cart updated successfully",
        data: {
          action: "updated",
          quantity: newQuantity,
        },
      });
    } else {
      // Add new item to cart
      const insertResult = await executeQuery(
        "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [req.user.id, product_id, quantity]
      );

      if (!insertResult.success) {
        throw new Error("Failed to add item to cart");
      }

      res.status(201).json({
        success: true,
        message: "Item added to cart successfully",
        data: {
          action: "added",
          cart_item_id: insertResult.data.insertId,
        },
      });
    }
  })
);

// @route   POST /api/cart/add
// @desc    Add item to cart (alias for POST /api/cart for test compatibility)
// @access  Private
router.post(
  "/add",
  validateCartItem,
  asyncHandler(async (req, res) => {
    const { product_id, quantity } = req.body;

    // Check if product exists and is active
    const productResult = await executeQuery(
      "SELECT id, name, price, stock_quantity, is_active FROM products WHERE id = ?",
      [product_id]
    );

    if (!productResult.success || productResult.data.length === 0) {
      return res.status(404).json({
        error: "Product not found",
        message: "Product with this ID does not exist",
      });
    }

    const product = productResult.data[0];

    if (!product.is_active) {
      return res.status(400).json({
        error: "Product unavailable",
        message: "This product is currently not available",
      });
    }

    if (product.stock_quantity < quantity) {
      return res.status(400).json({
        error: "Insufficient stock",
        message: `Only ${product.stock_quantity} items available in stock`,
      });
    }

    // Check if item already exists in cart
    const existingItem = await executeQuery(
      "SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?",
      [req.user.id, product_id]
    );

    if (existingItem.success && existingItem.data.length > 0) {
      // Update existing item
      const newQuantity = existingItem.data[0].quantity + quantity;

      if (product.stock_quantity < newQuantity) {
        return res.status(400).json({
          error: "Insufficient stock",
          message: `Only ${product.stock_quantity} items available in stock`,
        });
      }

      const updateResult = await executeQuery(
        "UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [newQuantity, existingItem.data[0].id]
      );

      if (!updateResult.success) {
        throw new Error("Failed to update cart item");
      }

      res.json({
        success: true,
        message: "Cart updated successfully",
        data: {
          action: "updated",
          quantity: newQuantity,
        },
      });
    } else {
      // Add new item to cart
      const insertResult = await executeQuery(
        "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [req.user.id, product_id, quantity]
      );

      if (!insertResult.success) {
        throw new Error("Failed to add item to cart");
      }

      res.status(201).json({
        success: true,
        message: "Item added to cart successfully",
        data: {
          action: "added",
          cart_item_id: insertResult.data.insertId,
        },
      });
    }
  })
);

// @route   PUT /api/cart/:id
// @desc    Update cart item quantity
// @access  Private
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const cartItemId = parseInt(req.params.id);
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        error: "Invalid quantity",
        message: "Quantity must be at least 1",
      });
    }

    // Check if cart item exists and belongs to user
    const cartItemResult = await executeQuery(
      `SELECT c.id, c.product_id, p.stock_quantity, p.is_active, p.name
     FROM cart c
     JOIN products p ON c.product_id = p.id
     WHERE c.id = ? AND c.user_id = ?`,
      [cartItemId, req.user.id]
    );

    if (!cartItemResult.success || cartItemResult.data.length === 0) {
      return res.status(404).json({
        error: "Cart item not found",
        message:
          "Cart item with this ID does not exist or does not belong to you",
      });
    }

    const cartItem = cartItemResult.data[0];

    if (!cartItem.is_active) {
      return res.status(400).json({
        error: "Product unavailable",
        message: "This product is currently not available",
      });
    }

    if (cartItem.stock_quantity < quantity) {
      return res.status(400).json({
        error: "Insufficient stock",
        message: `Only ${cartItem.stock_quantity} items available in stock`,
      });
    }

    // Update cart item
    const result = await executeQuery(
      "UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [quantity, cartItemId]
    );

    if (!result.success) {
      throw new Error("Failed to update cart item");
    }

    res.json({
      success: true,
      message: "Cart item updated successfully",
      data: {
        quantity,
      },
    });
  })
);

// @route   DELETE /api/cart/:id
// @desc    Remove item from cart
// @access  Private
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const cartItemId = parseInt(req.params.id);

    // Check if cart item exists and belongs to user
    const cartItemExists = await executeQuery(
      "SELECT id FROM cart WHERE id = ? AND user_id = ?",
      [cartItemId, req.user.id]
    );

    if (!cartItemExists.success || cartItemExists.data.length === 0) {
      return res.status(404).json({
        error: "Cart item not found",
        message:
          "Cart item with this ID does not exist or does not belong to you",
      });
    }

    // Delete cart item
    const result = await executeQuery("DELETE FROM cart WHERE id = ?", [
      cartItemId,
    ]);

    if (!result.success) {
      throw new Error("Failed to remove cart item");
    }

    res.json({
      success: true,
      message: "Item removed from cart successfully",
    });
  })
);

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete(
  "/",
  asyncHandler(async (req, res) => {
    const result = await executeQuery("DELETE FROM cart WHERE user_id = ?", [
      req.user.id,
    ]);

    if (!result.success) {
      throw new Error("Failed to clear cart");
    }

    res.json({
      success: true,
      message: "Cart cleared successfully",
      data: {
        deleted_items: result.data.affectedRows,
      },
    });
  })
);

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart (alias for DELETE /api/cart)
// @access  Private
router.delete(
  "/clear",
  asyncHandler(async (req, res) => {
    const result = await executeQuery("DELETE FROM cart WHERE user_id = ?", [
      req.user.id,
    ]);

    if (!result.success) {
      throw new Error("Failed to clear cart");
    }

    res.json({
      success: true,
      message: "Cart cleared successfully",
      data: {
        deleted_items: result.data.affectedRows,
      },
    });
  })
);

// @route   GET /api/cart/count
// @desc    Get cart item count
// @access  Private
router.get(
  "/count",
  asyncHandler(async (req, res) => {
    const result = await executeQuery(
      "SELECT SUM(quantity) as total_items FROM cart WHERE user_id = ?",
      [req.user.id]
    );

    if (!result.success) {
      throw new Error("Failed to get cart count");
    }

    const totalItems = result.data[0].total_items || 0;

    res.json({
      success: true,
      data: {
        total_items: totalItems,
      },
    });
  })
);

// @route   POST /api/cart/bulk-add
// @desc    Add multiple items to cart
// @access  Private
router.post(
  "/bulk-add",
  asyncHandler(async (req, res) => {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Invalid items",
        message: "Items must be a non-empty array",
      });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      const { product_id, quantity } = items[i];

      try {
        // Check if product exists and is active
        const productResult = await executeQuery(
          "SELECT id, name, price, stock_quantity, is_active FROM products WHERE id = ?",
          [product_id]
        );

        if (!productResult.success || productResult.data.length === 0) {
          errors.push({
            index: i,
            product_id,
            error: "Product not found",
          });
          continue;
        }

        const product = productResult.data[0];

        if (!product.is_active) {
          errors.push({
            index: i,
            product_id,
            error: "Product unavailable",
          });
          continue;
        }

        if (product.stock_quantity < quantity) {
          errors.push({
            index: i,
            product_id,
            error: `Insufficient stock (available: ${product.stock_quantity})`,
          });
          continue;
        }

        // Check if item already exists in cart
        const existingItem = await executeQuery(
          "SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?",
          [req.user.id, product_id]
        );

        if (existingItem.success && existingItem.data.length > 0) {
          // Update existing item
          const newQuantity = existingItem.data[0].quantity + quantity;

          if (product.stock_quantity < newQuantity) {
            errors.push({
              index: i,
              product_id,
              error: `Insufficient stock for total quantity (available: ${product.stock_quantity})`,
            });
            continue;
          }

          await executeQuery(
            "UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [newQuantity, existingItem.data[0].id]
          );

          results.push({
            index: i,
            product_id,
            action: "updated",
            quantity: newQuantity,
          });
        } else {
          // Add new item to cart
          const insertResult = await executeQuery(
            "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
            [req.user.id, product_id, quantity]
          );

          results.push({
            index: i,
            product_id,
            action: "added",
            cart_item_id: insertResult.data.insertId,
          });
        }
      } catch (error) {
        errors.push({
          index: i,
          product_id,
          error: error.message,
        });
      }
    }

    res.json({
      success: errors.length === 0,
      message:
        errors.length === 0
          ? "All items processed successfully"
          : "Some items could not be processed",
      data: {
        processed: results,
        errors,
      },
    });
  })
);

module.exports = router;
