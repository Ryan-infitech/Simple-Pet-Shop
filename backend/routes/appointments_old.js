const express = require("express");
const { executeQuery } = require("../config/database");
const { adminMiddleware } = require("../middleware/auth");
const { validateAppointment } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

// @route   GET /api/appointments
// @desc    Get user's appointments or all appointments (admin)
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

    // If not admin, only show user's own appointments
    if (req.user.role !== "admin") {
      whereClause += " AND a.user_id = ?";
      queryParams.push(req.user.id);
    }

    if (status) {
      whereClause += " AND a.status = ?";
      queryParams.push(status);
    }

    if (startDate) {
      whereClause += " AND a.appointment_date >= ?";
      queryParams.push(startDate);
    }

    if (endDate) {
      whereClause += " AND a.appointment_date <= ?";
      queryParams.push(endDate);
    }

    // Get total count
    const countResult = await executeQuery(
      `SELECT COUNT(*) as total 
     FROM appointments a 
     ${whereClause}`,
      queryParams
    );

    const total = countResult.success ? countResult.data[0].total : 0;    // Get appointments
    const result = await executeQuery(
      `SELECT a.*, s.name as service_name, s.price as service_price, s.duration as service_duration,
     u.full_name, u.email, u.phone
     FROM appointments a
     JOIN services s ON a.service_id = s.id
     JOIN users u ON a.user_id = u.id
     ${whereClause}
     ORDER BY a.appointment_date DESC, a.appointment_time DESC
     LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    if (!result.success) {
      throw new Error("Failed to fetch appointments");
    }

    res.json({
      success: true,
      data: {
        appointments: result.data,
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

// @route   GET /api/appointments/calendar
// @desc    Get appointments for calendar view
// @access  Private
router.get(
  "/calendar",
  asyncHandler(async (req, res) => {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    let whereClause =
      "WHERE MONTH(a.appointment_date) = ? AND YEAR(a.appointment_date) = ?";
    const queryParams = [month, year];

    // If not admin, only show user's own appointments
    if (req.user.role !== "admin") {
      whereClause += " AND a.user_id = ?";
      queryParams.push(req.user.id);
    }

    const result = await executeQuery(
      `SELECT a.id, a.appointment_date, a.appointment_time, a.status,
     s.name as service_name, s.duration, a.pet_name
     FROM appointments a
     JOIN services s ON a.service_id = s.id
     ${whereClause}
     ORDER BY a.appointment_date, a.appointment_time`,
      queryParams
    );

    if (!result.success) {
      throw new Error("Failed to fetch calendar appointments");
    }

    // Group appointments by date
    const appointmentsByDate = {};
    result.data.forEach((appointment) => {
      const date = appointment.appointment_date.toISOString().split("T")[0];
      if (!appointmentsByDate[date]) {
        appointmentsByDate[date] = [];
      }
      appointmentsByDate[date].push(appointment);
    });

    res.json({
      success: true,
      data: {
        month,
        year,
        appointments_by_date: appointmentsByDate,
      },
    });
  })
);

// @route   GET /api/appointments/stats
// @desc    Get appointment statistics (admin only)
// @access  Private/Admin
router.get(
  "/stats",
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const period = req.query.period || "month"; // day, week, month, year

    let dateFilter = "";
    switch (period) {
      case "day":
        dateFilter = "DATE(a.created_at) = CURDATE()";
        break;
      case "week":
        dateFilter = "YEARWEEK(a.created_at) = YEARWEEK(NOW())";
        break;
      case "month":
        dateFilter =
          "MONTH(a.created_at) = MONTH(NOW()) AND YEAR(a.created_at) = YEAR(NOW())";
        break;
      case "year":
        dateFilter = "YEAR(a.created_at) = YEAR(NOW())";
        break;
      default:
        dateFilter =
          "MONTH(a.created_at) = MONTH(NOW()) AND YEAR(a.created_at) = YEAR(NOW())";
    }

    // Get appointment counts by status
    const statusResult = await executeQuery(
      `SELECT status, COUNT(*) as count
     FROM appointments a
     WHERE ${dateFilter}
     GROUP BY status`,
      []
    );

    // Get popular services
    const servicesResult = await executeQuery(
      `SELECT s.name, COUNT(a.id) as booking_count
     FROM appointments a
     JOIN services s ON a.service_id = s.id
     WHERE ${dateFilter}
     GROUP BY s.id, s.name
     ORDER BY booking_count DESC
     LIMIT 5`,
      []
    );

    // Get revenue
    const revenueResult = await executeQuery(
      `SELECT SUM(total_amount) as total_revenue
     FROM appointments a
     WHERE ${dateFilter} AND status IN ('completed', 'confirmed')`,
      []
    );

    res.json({
      success: true,
      data: {
        period,
        status_counts: statusResult.success ? statusResult.data : [],
        popular_services: servicesResult.success ? servicesResult.data : [],
        total_revenue: revenueResult.success
          ? revenueResult.data[0].total_revenue || 0
          : 0,
      },
    });
  })
);

// @route   GET /api/appointments/:id
// @desc    Get single appointment by ID
// @access  Private (own appointment) or Admin
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const appointmentId = parseInt(req.params.id);

    let whereClause = "WHERE a.id = ?";
    const queryParams = [appointmentId];

    // If not admin, only allow access to own appointments
    if (req.user.role !== "admin") {
      whereClause += " AND a.user_id = ?";
      queryParams.push(req.user.id);
    }

    const result = await executeQuery(
      `SELECT a.*, s.name as service_name, s.description as service_description, 
     s.price as service_price, s.duration as service_duration, s.image as service_image,
     u.first_name, u.last_name, u.email, u.phone
     FROM appointments a
     JOIN services s ON a.service_id = s.id
     JOIN users u ON a.user_id = u.id
     ${whereClause}`,
      queryParams
    );

    if (!result.success || result.data.length === 0) {
      return res.status(404).json({
        error: "Appointment not found",
        message:
          "Appointment with this ID does not exist or you do not have access to it",
      });
    }

    res.json({
      success: true,
      data: {
        appointment: result.data[0],
      },
    });
  })
);

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private
router.post(
  "/",
  validateAppointment,
  asyncHandler(async (req, res) => {
    const {
      service_id,
      appointment_date,
      appointment_time,
      pet_name,
      pet_type,
      pet_breed,
      special_requests,
    } = req.body;

    // Check if service exists and is active
    const serviceResult = await executeQuery(
      "SELECT id, name, price, is_active FROM services WHERE id = ?",
      [service_id]
    );

    if (!serviceResult.success || serviceResult.data.length === 0) {
      return res.status(404).json({
        error: "Service not found",
        message: "Service with this ID does not exist",
      });
    }

    const service = serviceResult.data[0];

    if (!service.is_active) {
      return res.status(400).json({
        error: "Service unavailable",
        message: "This service is currently not available",
      });
    }

    // Check if the time slot is available
    const conflictResult = await executeQuery(
      'SELECT id FROM appointments WHERE service_id = ? AND appointment_date = ? AND appointment_time = ? AND status IN ("scheduled", "confirmed")',
      [service_id, appointment_date, appointment_time]
    );

    if (conflictResult.success && conflictResult.data.length > 0) {
      return res.status(409).json({
        error: "Time slot unavailable",
        message: "This time slot is already booked",
      });
    }

    // Check if appointment date is in the future
    const appointmentDateTime = new Date(
      `${appointment_date} ${appointment_time}`
    );
    const now = new Date();

    if (appointmentDateTime <= now) {
      return res.status(400).json({
        error: "Invalid date/time",
        message: "Appointment must be scheduled for a future date and time",
      });
    }

    // Create appointment
    const result = await executeQuery(
      `INSERT INTO appointments (user_id, service_id, appointment_date, appointment_time, 
     pet_name, pet_type, pet_breed, special_requests, total_amount, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        service_id,
        appointment_date,
        appointment_time,
        pet_name || null,
        pet_type || null,
        pet_breed || null,
        special_requests || null,
        service.price,
        "scheduled",
      ]
    );

    if (!result.success) {
      throw new Error("Failed to create appointment");
    }

    // Get the created appointment with service details
    const newAppointment = await executeQuery(
      `SELECT a.*, s.name as service_name, s.price as service_price, s.duration as service_duration
     FROM appointments a
     JOIN services s ON a.service_id = s.id
     WHERE a.id = ?`,
      [result.data.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Appointment scheduled successfully",
      data: {
        appointment: newAppointment.data[0],
      },
    });
  })
);

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private (own appointment) or Admin
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const appointmentId = parseInt(req.params.id);
    const {
      appointment_date,
      appointment_time,
      pet_name,
      pet_type,
      pet_breed,
      special_requests,
    } = req.body;

    // Check if appointment exists and user has access
    let whereClause = "WHERE id = ?";
    const checkParams = [appointmentId];

    if (req.user.role !== "admin") {
      whereClause += " AND user_id = ?";
      checkParams.push(req.user.id);
    }

    const appointmentResult = await executeQuery(
      `SELECT * FROM appointments ${whereClause}`,
      checkParams
    );

    if (!appointmentResult.success || appointmentResult.data.length === 0) {
      return res.status(404).json({
        error: "Appointment not found",
        message:
          "Appointment with this ID does not exist or you do not have access to it",
      });
    }

    const appointment = appointmentResult.data[0];

    // Check if appointment can still be modified
    if (
      appointment.status === "completed" ||
      appointment.status === "cancelled"
    ) {
      return res.status(400).json({
        error: "Cannot modify appointment",
        message: "Completed or cancelled appointments cannot be modified",
      });
    }

    // If updating date/time, check for conflicts
    if (appointment_date && appointment_time) {
      const conflictResult = await executeQuery(
        'SELECT id FROM appointments WHERE service_id = ? AND appointment_date = ? AND appointment_time = ? AND status IN ("scheduled", "confirmed") AND id != ?',
        [
          appointment.service_id,
          appointment_date,
          appointment_time,
          appointmentId,
        ]
      );

      if (conflictResult.success && conflictResult.data.length > 0) {
        return res.status(409).json({
          error: "Time slot unavailable",
          message: "This time slot is already booked",
        });
      }

      // Check if new appointment date is in the future
      const appointmentDateTime = new Date(
        `${appointment_date} ${appointment_time}`
      );
      const now = new Date();

      if (appointmentDateTime <= now) {
        return res.status(400).json({
          error: "Invalid date/time",
          message: "Appointment must be scheduled for a future date and time",
        });
      }
    }

    const updateFields = [];
    const queryParams = [];

    if (appointment_date) {
      updateFields.push("appointment_date = ?");
      queryParams.push(appointment_date);
    }

    if (appointment_time) {
      updateFields.push("appointment_time = ?");
      queryParams.push(appointment_time);
    }

    if (pet_name !== undefined) {
      updateFields.push("pet_name = ?");
      queryParams.push(pet_name);
    }

    if (pet_type !== undefined) {
      updateFields.push("pet_type = ?");
      queryParams.push(pet_type);
    }

    if (pet_breed !== undefined) {
      updateFields.push("pet_breed = ?");
      queryParams.push(pet_breed);
    }

    if (special_requests !== undefined) {
      updateFields.push("special_requests = ?");
      queryParams.push(special_requests);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: "No data to update",
        message: "Please provide at least one field to update",
      });
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    const query = `UPDATE appointments SET ${updateFields.join(
      ", "
    )} WHERE id = ?`;
    queryParams.push(appointmentId);

    const result = await executeQuery(query, queryParams);

    if (!result.success) {
      throw new Error("Failed to update appointment");
    }

    // Get updated appointment
    const updatedAppointment = await executeQuery(
      `SELECT a.*, s.name as service_name, s.price as service_price, s.duration as service_duration
     FROM appointments a
     JOIN services s ON a.service_id = s.id
     WHERE a.id = ?`,
      [appointmentId]
    );

    res.json({
      success: true,
      message: "Appointment updated successfully",
      data: {
        appointment: updatedAppointment.data[0],
      },
    });
  })
);

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status
// @access  Private (limited) or Admin
router.put(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const appointmentId = parseInt(req.params.id);
    const { status } = req.body;

    const validStatuses = ["scheduled", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        message: "Status must be one of: " + validStatuses.join(", "),
      });
    }

    // Check if appointment exists and user has access
    let whereClause = "WHERE id = ?";
    const checkParams = [appointmentId];

    if (req.user.role !== "admin") {
      whereClause += " AND user_id = ?";
      checkParams.push(req.user.id);
    }

    const appointmentResult = await executeQuery(
      `SELECT * FROM appointments ${whereClause}`,
      checkParams
    );

    if (!appointmentResult.success || appointmentResult.data.length === 0) {
      return res.status(404).json({
        error: "Appointment not found",
        message:
          "Appointment with this ID does not exist or you do not have access to it",
      });
    }

    const appointment = appointmentResult.data[0];

    // Validate status transitions
    if (req.user.role !== "admin") {
      // Customers can only cancel their own appointments
      if (status !== "cancelled") {
        return res.status(403).json({
          error: "Access denied",
          message: "You can only cancel your own appointments",
        });
      }

      // Can't cancel completed appointments
      if (appointment.status === "completed") {
        return res.status(400).json({
          error: "Cannot cancel",
          message: "Completed appointments cannot be cancelled",
        });
      }
    }

    // Update appointment status
    const result = await executeQuery(
      "UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, appointmentId]
    );

    if (!result.success) {
      throw new Error("Failed to update appointment status");
    }

    res.json({
      success: true,
      message: `Appointment ${status} successfully`,
    });
  })
);

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment (admin only)
// @access  Private/Admin
router.delete(
  "/:id",
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const appointmentId = parseInt(req.params.id);

    // Check if appointment exists
    const appointmentExists = await executeQuery(
      "SELECT id, status FROM appointments WHERE id = ?",
      [appointmentId]
    );

    if (!appointmentExists.success || appointmentExists.data.length === 0) {
      return res.status(404).json({
        error: "Appointment not found",
        message: "Appointment with this ID does not exist",
      });
    }

    // Delete appointment
    const result = await executeQuery("DELETE FROM appointments WHERE id = ?", [
      appointmentId,
    ]);

    if (!result.success) {
      throw new Error("Failed to delete appointment");
    }

    res.json({
      success: true,
      message: "Appointment deleted successfully",
    });
  })
);

module.exports = router;
