const express = require("express");
const { executeQuery, getConnection } = require("../config/database");
const { adminMiddleware } = require("../middleware/auth");
const { validateOrder } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ORD-${timestamp.slice(-6)}${random}`;
};

// @route   GET /api/orders
// @desc    Get user's orders or all orders (admin)
// @access  Private
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || "";
    const startDate = req.query.start_date || "";
    const endDate = req.query.end_date || "";

    let whereClause = "WHERE 1=1";
    const queryParams = [];

    // If not admin, only show user's own orders
    if (req.user.role !== "admin") {
      whereClause += " AND o.user_id = ?";
      queryParams.push(req.user.id);
    }

    if (status) {
      whereClause += " AND o.status = ?";
      queryParams.push(status);
    }

    if (startDate) {
      whereClause += " AND DATE(o.created_at) >= ?";
      queryParams.push(startDate);
    }

    if (endDate) {
      whereClause += " AND DATE(o.created_at) <= ?";
      queryParams.push(endDate);
    }

    try {
      // Get total count
      const countResult = await executeQuery(
        `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
        queryParams
      );

      console.log("Count result:", countResult);
      const total = countResult.success ? countResult.data[0].total : 0; // Get orders - simplified query for debugging
      console.log("Orders query whereClause:", whereClause);
      console.log("Query params:", queryParams);
      console.log("Limit:", limit, "Offset:", offset);

      // First try a simple query without LIMIT/OFFSET
      const simpleResult = await executeQuery(
        `SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at
         FROM orders o
         JOIN users u ON o.user_id = u.id
         ${whereClause}
         ORDER BY o.created_at DESC`,
        queryParams
      );

      console.log("Simple query result:", simpleResult);

      if (!simpleResult.success) {
        console.error("Simple query failed:", simpleResult.error);
        throw new Error("Failed to fetch orders");
      }

      // If simple query works, try with pagination
      const result = await executeQuery(
        `SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at, o.updated_at, 
               o.shipping_address, o.payment_method, o.payment_status, o.notes, o.user_id,
               u.full_name, u.email
         FROM orders o
         JOIN users u ON o.user_id = u.id
         ${whereClause}
         ORDER BY o.created_at DESC
         LIMIT ${limit} OFFSET ${offset}`,
        queryParams
      );
      console.log("Orders query result:", result);

      if (!result.success) {
        console.error("Orders query failed:", result.error);
        throw new Error("Failed to fetch orders");
      }

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        result.data.map(async (order) => {
          const itemsResult = await executeQuery(
            `SELECT oi.*, p.name as product_name, p.image_url as product_image
             FROM order_items oi
             LEFT JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?`,
            [order.id]
          );

          return {
            ...order,
            items: itemsResult.success ? itemsResult.data : [],
          };
        })
      );

      res.json({
        success: true,
        data: {
          orders: ordersWithItems,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Orders route error:", error);
      throw error;
    }
  })
);

// @route   GET /api/orders/stats
// @desc    Get order statistics (admin only)
// @access  Private/Admin
router.get(
  "/stats",
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const period = req.query.period || "month"; // day, week, month, year

    let dateFilter = "";
    switch (period) {
      case "day":
        dateFilter = "DATE(created_at) = CURDATE()";
        break;
      case "week":
        dateFilter = "YEARWEEK(created_at) = YEARWEEK(NOW())";
        break;
      case "month":
        dateFilter =
          "MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())";
        break;
      case "year":
        dateFilter = "YEAR(created_at) = YEAR(NOW())";
        break;
      default:
        dateFilter =
          "MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())";
    }

    // Get order counts by status
    const statusResult = await executeQuery(
      `SELECT status, COUNT(*) as count, SUM(total_amount) as total_amount
     FROM orders
     WHERE ${dateFilter}
     GROUP BY status`,
      []
    );

    // Get top selling products
    const productsResult = await executeQuery(
      `SELECT p.name, SUM(oi.quantity) as total_sold, SUM(oi.total_price) as total_revenue
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     JOIN orders o ON oi.order_id = o.id
     WHERE ${dateFilter}
     GROUP BY p.id, p.name
     ORDER BY total_sold DESC
     LIMIT 10`,
      []
    );

    // Get revenue summary
    const revenueResult = await executeQuery(
      `SELECT 
       COUNT(*) as total_orders,
       SUM(total_amount) as total_revenue,
       AVG(total_amount) as average_order_value,
       SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as paid_revenue
     FROM orders
     WHERE ${dateFilter}`,
      []
    );

    res.json({
      success: true,
      data: {
        period,
        status_summary: statusResult.success ? statusResult.data : [],
        top_products: productsResult.success ? productsResult.data : [],
        revenue_summary: revenueResult.success ? revenueResult.data[0] : {},
      },
    });
  })
);

// @route   GET /api/orders/:id
// @desc    Get single order by ID with items
// @access  Private (own order) or Admin
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const orderId = parseInt(req.params.id);
    console.log(
      `Retrieving order with ID: ${orderId} for user: ${req.user.id}, role: ${req.user.role}`
    );

    let whereClause = "WHERE o.id = ?";
    const queryParams = [orderId];

    // If not admin, only allow access to own orders
    if (req.user.role !== "admin") {
      whereClause += " AND o.user_id = ?";
      queryParams.push(req.user.id);
    }
    console.log(
      `Order query params:`,
      queryParams,
      `whereClause: ${whereClause}`
    ); // Get order details - simplify the query to avoid columns that might not exist
    const orderResult = await executeQuery(
      `SELECT o.*
     FROM orders o
     WHERE ${whereClause.replace("WHERE ", "")}`,
      queryParams
    );

    console.log(`Order query result:`, orderResult);

    if (!orderResult.success || orderResult.data.length === 0) {
      console.log(
        `Order not found or not accessible for user ${req.user.id} - order ID: ${orderId}`
      );
      return res.status(404).json({
        error: "Order not found",
        message:
          "Order with this ID does not exist or you do not have access to it",
      });
    }

    const order = orderResult.data[0];

    // Get order items
    const itemsResult = await executeQuery(
      `SELECT oi.*, p.name as product_name, p.image as product_image
     FROM order_items oi
     LEFT JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?
     ORDER BY oi.id`,
      [orderId]
    );

    if (itemsResult.success) {
      order.items = itemsResult.data;
    } else {
      order.items = [];
    }

    res.json({
      success: true,
      data: {
        order,
      },
    });
  })
);

// @route   POST /api/orders
// @desc    Create new order from cart
// @access  Private
router.post(
  "/",
  validateOrder,
  asyncHandler(async (req, res) => {
    const { items, shipping_address, billing_address, payment_method, notes } =
      req.body;

    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      // Validate all items and calculate total
      let totalAmount = 0;
      const validatedItems = [];

      for (const item of items) {
        const { product_id, quantity } = item;

        // Get product details
        const [productRows] = await connection.execute(
          "SELECT id, name, price, stock_quantity, is_active FROM products WHERE id = ? FOR UPDATE",
          [product_id]
        );

        if (productRows.length === 0) {
          throw new Error(`Product with ID ${product_id} not found`);
        }

        const product = productRows[0];

        if (!product.is_active) {
          throw new Error(`Product "${product.name}" is not available`);
        }

        if (product.stock_quantity < quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}, Requested: ${quantity}`
          );
        }

        const itemTotal = product.price * quantity;
        totalAmount += itemTotal;

        validatedItems.push({
          product_id: product.id,
          quantity,
          unit_price: product.price,
          total_price: itemTotal,
        });
      }

      // Create order
      const orderNumber = generateOrderNumber();
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (user_id, order_number, total_amount, shipping_address, billing_address, payment_method, notes, status, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          orderNumber,
          totalAmount,
          shipping_address,
          billing_address || shipping_address,
          payment_method,
          notes || null,
          "pending",
          "pending",
        ]
      );

      const orderId = orderResult.insertId;

      // Create order items and update stock
      for (const item of validatedItems) {
        // Insert order item
        await connection.execute(
          "INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)",
          [
            orderId,
            item.product_id,
            item.quantity,
            item.unit_price,
            item.total_price,
          ]
        );

        // Update product stock
        await connection.execute(
          "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
          [item.quantity, item.product_id]
        );
      }

      // Clear user's cart for ordered items
      const productIds = items.map((item) => item.product_id);
      if (productIds.length > 0) {
        await connection.execute(
          `DELETE FROM cart WHERE user_id = ? AND product_id IN (${productIds
            .map(() => "?")
            .join(",")})`,
          [req.user.id, ...productIds]
        );
      }

      await connection.commit();

      // Get the created order with items
      const newOrderResult = await executeQuery(
        `SELECT o.*, u.first_name, u.last_name, u.email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
        [orderId]
      );

      const orderItemsResult = await executeQuery(
        `SELECT oi.*, p.name as product_name, p.image as product_image
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
        [orderId]
      );

      const order = newOrderResult.data[0];
      order.items = orderItemsResult.data;

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: {
          order,
        },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  })
);

// @route   PUT /api/orders/:id/status
// @desc    Update order status (admin only)
// @access  Private/Admin
router.put(
  "/:id/status",
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        message: "Status must be one of: " + validStatuses.join(", "),
      });
    }

    // Check if order exists
    const orderExists = await executeQuery(
      "SELECT id, status as current_status FROM orders WHERE id = ?",
      [orderId]
    );

    if (!orderExists.success || orderExists.data.length === 0) {
      return res.status(404).json({
        error: "Order not found",
        message: "Order with this ID does not exist",
      });
    }

    const currentStatus = orderExists.data[0].current_status;

    // Validate status transitions
    if (currentStatus === "delivered" && status !== "delivered") {
      return res.status(400).json({
        error: "Invalid status transition",
        message: "Delivered orders cannot be changed to other statuses",
      });
    }

    if (currentStatus === "cancelled" && status !== "cancelled") {
      return res.status(400).json({
        error: "Invalid status transition",
        message: "Cancelled orders cannot be changed to other statuses",
      });
    }

    // Update order status
    const result = await executeQuery(
      "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, orderId]
    );

    if (!result.success) {
      throw new Error("Failed to update order status");
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: {
        order_id: orderId,
        status,
      },
    });
  })
);

// @route   PUT /api/orders/:id/payment-status
// @desc    Update payment status (admin only)
// @access  Private/Admin
router.put(
  "/:id/payment-status",
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const orderId = parseInt(req.params.id);
    const { payment_status } = req.body;

    const validPaymentStatuses = ["pending", "paid", "failed", "refunded"];
    if (!validPaymentStatuses.includes(payment_status)) {
      return res.status(400).json({
        error: "Invalid payment status",
        message:
          "Payment status must be one of: " + validPaymentStatuses.join(", "),
      });
    }

    // Check if order exists
    const orderExists = await executeQuery(
      "SELECT id FROM orders WHERE id = ?",
      [orderId]
    );

    if (!orderExists.success || orderExists.data.length === 0) {
      return res.status(404).json({
        error: "Order not found",
        message: "Order with this ID does not exist",
      });
    }

    // Update payment status
    const result = await executeQuery(
      "UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [payment_status, orderId]
    );

    if (!result.success) {
      throw new Error("Failed to update payment status");
    }

    res.json({
      success: true,
      message: `Payment status updated to ${payment_status}`,
      data: {
        order_id: orderId,
        payment_status,
      },
    });
  })
);

// @route   POST /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private (own order) or Admin
router.post(
  "/:id/cancel",
  asyncHandler(async (req, res) => {
    const orderId = parseInt(req.params.id);
    const { reason } = req.body;

    let whereClause = "WHERE id = ?";
    const queryParams = [orderId];

    // If not admin, only allow cancelling own orders
    if (req.user.role !== "admin") {
      whereClause += " AND user_id = ?";
      queryParams.push(req.user.id);
    }

    // Get order details
    const orderResult = await executeQuery(
      `SELECT id, status, payment_status FROM orders ${whereClause}`,
      queryParams
    );

    if (!orderResult.success || orderResult.data.length === 0) {
      return res.status(404).json({
        error: "Order not found",
        message:
          "Order with this ID does not exist or you do not have access to it",
      });
    }

    const order = orderResult.data[0];

    // Check if order can be cancelled
    if (order.status === "delivered") {
      return res.status(400).json({
        error: "Cannot cancel order",
        message: "Delivered orders cannot be cancelled",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        error: "Order already cancelled",
        message: "This order has already been cancelled",
      });
    }

    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      // Get order items to restore stock
      const [orderItems] = await connection.execute(
        "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
        [orderId]
      );

      // Restore product stock
      for (const item of orderItems) {
        await connection.execute(
          "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?",
          [item.quantity, item.product_id]
        );
      }

      // Update order status
      await connection.execute(
        'UPDATE orders SET status = ?, notes = CONCAT(COALESCE(notes, ""), ?, ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [
          "cancelled",
          reason ? `\nCancellation reason: ${reason}` : "",
          `\nCancelled on: ${new Date().toISOString()}`,
          orderId,
        ]
      );

      await connection.commit();

      res.json({
        success: true,
        message: "Order cancelled successfully",
        data: {
          order_id: orderId,
          status: "cancelled",
        },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  })
);

// @route   GET /api/orders/:id/invoice
// @desc    Get order invoice data
// @access  Private (own order) or Admin
router.get(
  "/:id/invoice",
  asyncHandler(async (req, res) => {
    const orderId = parseInt(req.params.id);

    let whereClause = "WHERE o.id = ?";
    const queryParams = [orderId];

    // If not admin, only allow access to own orders
    if (req.user.role !== "admin") {
      whereClause += " AND o.user_id = ?";
      queryParams.push(req.user.id);
    }

    // Get order with detailed information
    const orderResult = await executeQuery(
      `SELECT o.*, u.first_name, u.last_name, u.email, u.phone
     FROM orders o
     JOIN users u ON o.user_id = u.id
     ${whereClause}`,
      queryParams
    );

    if (!orderResult.success || orderResult.data.length === 0) {
      return res.status(404).json({
        error: "Order not found",
        message:
          "Order with this ID does not exist or you do not have access to it",
      });
    }

    const order = orderResult.data[0];

    // Get order items with product details
    const itemsResult = await executeQuery(
      `SELECT oi.*, p.name as product_name, p.image as product_image, p.sku
     FROM order_items oi
     LEFT JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?
     ORDER BY oi.id`,
      [orderId]
    );

    if (itemsResult.success) {
      order.items = itemsResult.data;
    } else {
      order.items = [];
    }

    // Calculate totals
    const subtotal = order.items.reduce(
      (sum, item) => sum + item.total_price,
      0
    );
    const tax = 0; // Add tax calculation if needed
    const shipping = order.shipping_fee || 0;
    const discount = order.discount_amount || 0;

    order.invoice_details = {
      subtotal,
      tax,
      shipping,
      discount,
      total: order.total_amount,
    };
    res.json({
      success: true,
      data: {
        order,
      },
    });
  })
);

// @route   POST /api/orders/from-cart
// @desc    Create order from user's cart
// @access  Private
router.post(
  "/from-cart",
  asyncHandler(async (req, res) => {
    const { payment_method, shipping_address, notes } = req.body;
    console.log("Creating order from cart:", {
      payment_method,
      shipping_address,
      notes,
    });

    if (!payment_method || !shipping_address) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Payment method and shipping address are required",
      });
    }

    // Normalize payment method
    let normalizedPaymentMethod = payment_method;
    if (
      payment_method === "bank-transfer" ||
      payment_method === "bank_transfer"
    ) {
      normalizedPaymentMethod = "transfer_bank";
    }

    // Get cart items
    const cartResult = await executeQuery(
      `SELECT c.*, p.name, p.price, p.stock_quantity
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ? AND p.is_active = 1`,
      [req.user.id]
    );

    if (!cartResult.success || cartResult.data.length === 0) {
      return res.status(400).json({
        error: "Empty cart",
        message: "Cart is empty or contains inactive products",
      });
    }

    const cartItems = cartResult.data;

    // Check stock availability
    for (const item of cartItems) {
      if (item.quantity > item.stock_quantity) {
        return res.status(400).json({
          error: "Insufficient stock",
          message: `Insufficient stock for ${item.name}. Available: ${item.stock_quantity}`,
        });
      }
    }

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.11; // 11% PPN
    const shipping = 25000; // Fixed shipping cost
    const total = subtotal + tax + shipping;
    const connection = await getConnection();

    try {
      await connection.beginTransaction();
      // Create order
      const orderNumber = generateOrderNumber();
      const orderResult = await connection.execute(
        `INSERT INTO orders (
          user_id, order_number, total_amount, status, payment_status,
          payment_method, shipping_address, notes, shipping_fee, tax_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          orderNumber,
          total,
          "pending",
          "pending",
          normalizedPaymentMethod,
          shipping_address,
          notes || "",
          shipping,
          tax,
        ]
      );

      if (!orderResult || !orderResult[0]) {
        throw new Error("Failed to create order");
      }

      const orderId = orderResult[0].insertId; // Create order items
      for (const item of cartItems) {
        const itemTotal = item.price * item.quantity;
        await connection.execute(
          `INSERT INTO order_items (order_id, product_id, quantity, price, total_price)
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.quantity, item.price, itemTotal]
        );

        // Update product stock
        await connection.execute(
          `UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?`,
          [item.quantity, item.product_id]
        );
      }

      // Clear cart
      await connection.execute(`DELETE FROM cart WHERE user_id = ?`, [
        req.user.id,
      ]);

      await connection.commit();

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: {
          order_id: orderId,
          order_number: orderNumber,
          total_amount: total,
          status: "pending",
          payment_status: "pending",
        },
      });
    } catch (error) {
      await connection.rollback();
      console.error("Create order error:", error);
      throw error;
    } finally {
      connection.release();
    }
  })
);

module.exports = router;
