// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error response
  let statusCode = 500;
  let message = "Internal server error";
  let errors = null;

  // Validation errors (express-validator)
  if (err.type === "validation") {
    statusCode = 400;
    message = "Validation failed";
    errors = err.errors;
  }

  // MySQL errors
  if (err.code) {
    switch (err.code) {
      case "ER_DUP_ENTRY":
        statusCode = 409;
        message = "Duplicate entry. Resource already exists";
        break;
      case "ER_NO_REFERENCED_ROW_2":
        statusCode = 400;
        message = "Referenced resource does not exist";
        break;
      case "ER_ROW_IS_REFERENCED_2":
        statusCode = 400;
        message = "Cannot delete resource. It is referenced by other records";
        break;
      case "ER_BAD_FIELD_ERROR":
        statusCode = 400;
        message = "Invalid field in query";
        break;
      case "ER_PARSE_ERROR":
        statusCode = 400;
        message = "Database query syntax error";
        break;
      default:
        statusCode = 500;
        message = "Database error";
    }
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Multer errors (file upload)
  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File too large";
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    statusCode = 400;
    message = "Too many files";
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    statusCode = 400;
    message = "Unexpected file field";
  }

  // Custom application errors
  if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Send error response
  const errorResponse = {
    error: message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  };

  // Include errors array if present
  if (errors) {
    errorResponse.errors = errors;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

// Custom error class for application errors
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";

    Error.captureStackTrace(this, this.constructor);
  }
}

// Async error wrapper to catch async errors in route handlers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  AppError,
  asyncHandler,
};
