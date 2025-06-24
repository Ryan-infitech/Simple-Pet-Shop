const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

// Import database configuration
const { testConnection } = require("./config/database");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const orderRoutes = require("./routes/orders");
const serviceRoutes = require("./routes/services");
const cartRoutes = require("./routes/cart");
const appointmentRoutes = require("./routes/appointments");
const paymentRoutes = require("./routes/payments");
const debugRoutes = require("./routes/debug");
const healthRoutes = require("./routes/health");
const adminRoutes = require("./routes/admin");

// Import middleware
const { errorHandler } = require("./middleware/errorHandler");
const { authMiddleware } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting - more generous for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Viiona Pet Shop API is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", authMiddleware, orderRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/cart", authMiddleware, cartRoutes);
app.use("/api/appointments", authMiddleware, appointmentRoutes);
app.use("/api/payments", authMiddleware, paymentRoutes);
app.use("/api/admin", authMiddleware, adminRoutes);
app.use("/api/debug", debugRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: `The endpoint ${req.originalUrl} does not exist`,
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const isDbConnected = await testConnection();
    if (!isDbConnected) {
      console.error(
        "❌ Failed to connect to database. Please check your database configuration."
      );
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Viiona Pet Shop API server is running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

startServer();
