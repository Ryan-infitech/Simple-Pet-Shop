const { body, validationResult } = require("express-validator");

// Validation result checker
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body("username")
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be between 3 and 50 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),

  body("first_name")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),

  body("last_name")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters and spaces"),

  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),

  handleValidationErrors,
];

// User login validation
const validateUserLogin = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

// Product validation
const validateProduct = [
  body("name")
    .isLength({ min: 2, max: 255 })
    .withMessage("Product name must be between 2 and 255 characters"),

  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),

  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("stock_quantity")
    .isInt({ min: 0 })
    .withMessage("Stock quantity must be a non-negative integer"),

  body("category_id")
    .isInt({ min: 1 })
    .withMessage("Valid category ID is required"),

  body("weight")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Weight must be a positive number"),

  body("brand")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Brand name must not exceed 100 characters"),

  body("sku")
    .optional()
    .isLength({ max: 100 })
    .withMessage("SKU must not exceed 100 characters"),

  handleValidationErrors,
];

// Category validation
const validateCategory = [
  body("name")
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters"),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),

  handleValidationErrors,
];

// Service validation
const validateService = [
  body("name")
    .isLength({ min: 2, max: 255 })
    .withMessage("Service name must be between 2 and 255 characters"),

  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),

  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("duration")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive integer (minutes)"),

  handleValidationErrors,
];

// Order validation
const validateOrder = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Order must contain at least one item"),

  body("items.*.product_id")
    .isInt({ min: 1 })
    .withMessage("Valid product ID is required for each item"),

  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),

  body("shipping_address")
    .isLength({ min: 10, max: 500 })
    .withMessage("Shipping address must be between 10 and 500 characters"),

  body("payment_method")
    .isIn([
      "credit-card",
      "debit-card",
      "e-wallet",
      "bank-transfer",
      "cash-on-delivery",
    ])
    .withMessage("Invalid payment method"),

  handleValidationErrors,
];

// Appointment validation
const validateAppointment = [
  body("service_id")
    .isInt({ min: 1 })
    .withMessage("Valid service ID is required"),

  body("appointment_date")
    .isDate()
    .withMessage("Valid appointment date is required"),

  body("appointment_time")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Valid appointment time is required (HH:MM format)"),

  body("pet_name")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Pet name must be between 1 and 100 characters"),

  body("pet_type")
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("Pet type must be between 1 and 50 characters"),

  body("pet_breed")
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("Pet breed must be between 1 and 50 characters"),

  handleValidationErrors,
];

// Review validation
const validateReview = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("comment")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Comment must not exceed 1000 characters"),

  handleValidationErrors,
];

// Cart item validation
const validateCartItem = [
  body("product_id")
    .isInt({ min: 1 })
    .withMessage("Valid product ID is required"),

  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),

  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateProduct,
  validateCategory,
  validateService,
  validateOrder,
  validateAppointment,
  validateReview,
  validateCartItem,
};
