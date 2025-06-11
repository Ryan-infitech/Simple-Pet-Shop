const express = require("express");
const { executeQuery } = require("../config/database");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

// Generate payment reference number
const generatePaymentReference = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `PAY-${timestamp.slice(-6)}${random}`;
};

// @route   POST /api/payments/quick
// @desc    Quick payment (for transfer bank - auto success)
// @access  Private
router.post(
  "/quick",
  asyncHandler(async (req, res) => {
    const { order_id, payment_method, amount } = req.body;

    if (!order_id || !payment_method || !amount) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Order ID, payment method, and amount are required",
      });
    }

    // Verify order exists and belongs to user
    const orderResult = await executeQuery(
      `SELECT id, total_amount, status, payment_status, user_id
       FROM orders 
       WHERE id = ? AND user_id = ?`,
      [order_id, req.user.id]
    );

    if (!orderResult.success || orderResult.data.length === 0) {
      return res.status(404).json({
        error: "Order not found",
        message: "Order not found or does not belong to you",
      });
    }

    const order = orderResult.data[0];

    if (order.payment_status === "paid") {
      return res.status(400).json({
        error: "Already paid",
        message: "This order has already been paid",
      });
    }

    if (Math.abs(order.total_amount - amount) > 0.01) {
      return res.status(400).json({
        error: "Amount mismatch",
        message: "Payment amount does not match order total",
      });
    }

    // For transfer bank, we auto-approve the payment
    const referenceNumber = generatePaymentReference();

    // Create payment record
    const paymentResult = await executeQuery(
      `INSERT INTO payments (
        order_id, user_id, amount, payment_method, status, 
        reference_number, paid_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        order_id,
        req.user.id,
        amount,
        payment_method,
        "success",
        referenceNumber,
      ]
    );

    if (!paymentResult.success) {
      throw new Error("Failed to create payment record");
    }

    // Update order status
    await executeQuery(
      `UPDATE orders 
       SET payment_status = 'paid', status = 'confirmed', updated_at = NOW()
       WHERE id = ?`,
      [order_id]
    );

    res.json({
      success: true,
      message: "Payment processed successfully",
      data: {
        payment_id: paymentResult.data.insertId,
        status: "success",
        reference_number: referenceNumber,
      },
    });
  })
);

// @route   GET /api/payments/:id
// @desc    Get payment details
// @access  Private
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const paymentId = req.params.id;

    const result = await executeQuery(
      `SELECT p.*, o.order_number, o.total_amount as order_total
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE p.id = ? AND p.user_id = ?`,
      [paymentId, req.user.id]
    );

    if (!result.success || result.data.length === 0) {
      return res.status(404).json({
        error: "Payment not found",
        message: "Payment record not found or does not belong to you",
      });
    }

    res.json({
      success: true,
      data: {
        payment: result.data[0],
      },
    });
  })
);

// @route   GET /api/payments/order/:orderId
// @desc    Get payments for an order
// @access  Private
router.get(
  "/order/:orderId",
  asyncHandler(async (req, res) => {
    const orderId = req.params.orderId;

    // Verify order belongs to user
    const orderResult = await executeQuery(
      `SELECT id FROM orders WHERE id = ? AND user_id = ?`,
      [orderId, req.user.id]
    );

    if (!orderResult.success || orderResult.data.length === 0) {
      return res.status(404).json({
        error: "Order not found",
        message: "Order not found or does not belong to you",
      });
    }

    const result = await executeQuery(
      `SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC`,
      [orderId]
    );

    res.json({
      success: true,
      data: {
        payments: result.success ? result.data : [],
      },
    });
  })
);

module.exports = router;
