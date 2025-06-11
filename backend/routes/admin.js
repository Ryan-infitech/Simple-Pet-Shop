const express = require("express");
const { executeQuery } = require("../config/database");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

// Apply auth middleware first, then admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    try {
      // Get service count
      const serviceResult = await executeQuery(
        "SELECT COUNT(*) as count FROM services WHERE 1=1"
      );
      const totalServices = serviceResult.data[0]?.count || 0;

      // Get product count
      const productResult = await executeQuery(
        "SELECT COUNT(*) as count FROM products WHERE 1=1"
      );
      const totalProducts = productResult.data[0]?.count || 0;

      // Get today's bookings (mock for now since we don't have appointments table)
      const totalBookings = 24;

      // Get monthly revenue (mock for now)
      const monthlyRevenue = 2500000;

      res.json({
        success: true,
        data: {
          totalServices,
          totalProducts,
          totalBookings,
          monthlyRevenue,
        },
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({
        error: "Server error",
        message: "Failed to fetch admin statistics",
      });
    }
  })
);

module.exports = router;
