const express = require("express");
const { executeQuery } = require("../config/database");
const {
  authMiddleware,
  adminMiddleware,
  optionalAuth,
} = require("../middleware/auth");
const { uploadSingle } = require("../middleware/upload");
const { validateService } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

// @route   GET /api/services
// @desc    Get all services with filtering and pagination
// @access  Public
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    const minPrice = parseFloat(req.query.min_price) || 0;
    const maxPrice = parseFloat(req.query.max_price) || 999999;
    const sortBy = req.query.sort_by || "created_at";
    const sortOrder = req.query.sort_order || "DESC";

    let whereClause = "WHERE 1=1";
    const queryParams = [];

    if (search) {
      whereClause += " AND (name LIKE ? OR description LIKE ?)";
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    if (minPrice > 0) {
      whereClause += " AND price >= ?";
      queryParams.push(minPrice);
    }

    if (maxPrice < 999999) {
      whereClause += " AND price <= ?";
      queryParams.push(maxPrice);
    }

    // Validate sort parameters
    const allowedSortFields = ["name", "price", "created_at", "duration"];
    const allowedSortOrders = ["ASC", "DESC"];

    const validSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "created_at";
    const validSortOrder = allowedSortOrders.includes(sortOrder.toUpperCase())
      ? sortOrder.toUpperCase()
      : "DESC";

    // Get total count
    const countResult = await executeQuery(
      `SELECT COUNT(*) as total FROM services ${whereClause}`,
      queryParams
    );

    const total = countResult.success ? countResult.data[0].total : 0; // Get services
    const result = await executeQuery(
      `SELECT s.*,
     0 as avg_rating,
     0 as review_count,
     0 as upcoming_appointments
     FROM services s 
     ${whereClause}
     ORDER BY s.${validSortBy} ${validSortOrder}
     LIMIT ${limit} OFFSET ${offset}`,
      [...queryParams]
    );

    if (!result.success) {
      throw new Error("Failed to fetch services");
    }

    res.json({
      success: true,
      data: {
        services: result.data,
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

// @route   GET /api/services/:id
// @desc    Get single service by ID
// @access  Public
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const serviceId = parseInt(req.params.id);

    const result = await executeQuery(
      `SELECT s.*,
     0 as avg_rating,
     0 as review_count,
     0 as upcoming_appointments
     FROM services s 
     WHERE s.id = ? AND s.is_available = true`,
      [serviceId]
    );

    if (!result.success || result.data.length === 0) {
      return res.status(404).json({
        error: "Service not found",
        message: "Service with this ID does not exist or is not active",
      });
    }

    const service = result.data[0];

    // Set empty reviews array since reviews table doesn't exist
    service.recent_reviews = [];

    res.json({
      success: true,
      data: {
        service,
      },
    });
  })
);

// @route   POST /api/services
// @desc    Create new service (admin only)
// @access  Private/Admin
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  uploadSingle("service_image"),
  validateService,
  asyncHandler(async (req, res) => {
    const { name, description, price, duration } = req.body;

    let image_url = null;
    if (req.file) {
      image_url = `/uploads/services/${req.file.filename}`;
    }

    const result = await executeQuery(
      "INSERT INTO services (name, description, price, duration, image_url) VALUES (?, ?, ?, ?, ?)",
      [name, description, price, duration || null, image_url]
    );

    if (!result.success) {
      throw new Error("Failed to create service");
    }

    // Get the created service
    const newService = await executeQuery(
      "SELECT * FROM services WHERE id = ?",
      [result.data.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: {
        service: newService.data[0],
      },
    });
  })
);

// @route   PUT /api/services/:id
// @desc    Update service (admin only)
// @access  Private/Admin
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  uploadSingle("service_image"),
  asyncHandler(async (req, res) => {
    const serviceId = parseInt(req.params.id);
    const { name, description, price, duration } = req.body;

    // Check if service exists
    const serviceExists = await executeQuery(
      "SELECT id FROM services WHERE id = ?",
      [serviceId]
    );

    if (!serviceExists.success || serviceExists.data.length === 0) {
      return res.status(404).json({
        error: "Service not found",
        message: "Service with this ID does not exist",
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

    if (duration !== undefined) {
      updateFields.push("duration = ?");
      queryParams.push(duration);
    }
    if (req.file) {
      updateFields.push("image_url = ?");
      queryParams.push(`/uploads/services/${req.file.filename}`);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: "No data to update",
        message: "Please provide at least one field to update",
      });
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    const query = `UPDATE services SET ${updateFields.join(", ")} WHERE id = ?`;
    queryParams.push(serviceId);

    const result = await executeQuery(query, queryParams);

    if (!result.success) {
      throw new Error("Failed to update service");
    }

    // Get updated service
    const updatedService = await executeQuery(
      "SELECT * FROM services WHERE id = ?",
      [serviceId]
    );

    res.json({
      success: true,
      message: "Service updated successfully",
      data: {
        service: updatedService.data[0],
      },
    });
  })
);

// @route   DELETE /api/services/:id
// @desc    Delete service (admin only)
// @access  Private/Admin
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const serviceId = parseInt(req.params.id);

    // Check if service exists
    const serviceExists = await executeQuery(
      "SELECT id FROM services WHERE id = ?",
      [serviceId]
    );
    if (!serviceExists.success || serviceExists.data.length === 0) {
      return res.status(404).json({
        error: "Service not found",
        message: "Service with this ID does not exist",
      });
    }

    // Soft delete - mark as unavailable
    const result = await executeQuery(
      "UPDATE services SET is_available = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [serviceId]
    );

    if (!result.success) {
      throw new Error("Failed to delete service");
    }

    res.json({
      success: true,
      message: "Service deleted successfully",
    });
  })
);

// @route   PUT /api/services/:id/status
// @desc    Toggle service active status (admin only)
// @access  Private/Admin
router.put(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const serviceId = parseInt(req.params.id);
    const { is_available } = req.body;

    if (typeof is_available !== "boolean") {
      return res.status(400).json({
        error: "Invalid status",
        message: "is_available must be a boolean value",
      });
    }

    const result = await executeQuery(
      "UPDATE services SET is_available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [is_available, serviceId]
    );

    if (!result.success) {
      throw new Error("Failed to update service status");
    }

    if (result.data.affectedRows === 0) {
      return res.status(404).json({
        error: "Service not found",
        message: "Service with this ID does not exist",
      });
    }
    res.json({
      success: true,
      message: `Service ${
        is_available ? "activated" : "deactivated"
      } successfully`,
    });
  })
);

// @route   GET /api/services/:id/reviews
// @desc    Get service reviews
// @access  Public
router.get(
  "/:id/reviews",
  asyncHandler(async (req, res) => {
    const serviceId = parseInt(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await executeQuery(
      "SELECT COUNT(*) as total FROM reviews WHERE service_id = ?",
      [serviceId]
    );

    const total = countResult.success ? countResult.data[0].total : 0;

    // Get reviews
    const result = await executeQuery(
      `SELECT r.*, u.first_name, u.last_name, u.avatar 
     FROM reviews r 
     JOIN users u ON r.user_id = u.id 
     WHERE r.service_id = ? 
     ORDER BY r.created_at DESC 
     LIMIT ? OFFSET ?`,
      [serviceId, limit, offset]
    );

    if (!result.success) {
      throw new Error("Failed to fetch reviews");
    }

    res.json({
      success: true,
      data: {
        reviews: result.data,
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

// @route   GET /api/services/:id/availability
// @desc    Get service availability for booking
// @access  Public
router.get(
  "/:id/availability",
  asyncHandler(async (req, res) => {
    const serviceId = parseInt(req.params.id);
    const date = req.query.date; // Format: YYYY-MM-DD

    if (!date) {
      return res.status(400).json({
        error: "Date required",
        message: "Please provide a date parameter (YYYY-MM-DD format)",
      });
    } // Check if service exists
    const serviceExists = await executeQuery(
      "SELECT id, name, duration FROM services WHERE id = ? AND is_available = true",
      [serviceId]
    );

    if (!serviceExists.success || serviceExists.data.length === 0) {
      return res.status(404).json({
        error: "Service not found",
        message: "Service with this ID does not exist or is not active",
      });
    }

    // Get existing appointments for the date
    const appointmentsResult = await executeQuery(
      'SELECT appointment_time FROM appointments WHERE service_id = ? AND appointment_date = ? AND status IN ("scheduled", "confirmed")',
      [serviceId, date]
    );

    const bookedTimes = appointmentsResult.success
      ? appointmentsResult.data.map((apt) => apt.appointment_time)
      : [];

    // Generate available time slots (example: 9 AM to 5 PM)
    const workingHours = {
      start: "09:00",
      end: "17:00",
      intervalMinutes: 60, // 1 hour slots
    };

    const availableSlots = [];
    let currentTime = workingHours.start;

    while (currentTime < workingHours.end) {
      if (!bookedTimes.includes(currentTime)) {
        availableSlots.push(currentTime);
      }

      // Add interval
      const [hours, minutes] = currentTime.split(":").map(Number);
      const totalMinutes = hours * 60 + minutes + workingHours.intervalMinutes;
      const newHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;
      currentTime = `${newHours.toString().padStart(2, "0")}:${newMinutes
        .toString()
        .padStart(2, "0")}`;
    }

    res.json({
      success: true,
      data: {
        service: serviceExists.data[0],
        date,
        available_slots: availableSlots,
        booked_slots: bookedTimes,
      },
    });
  })
);

module.exports = router;
