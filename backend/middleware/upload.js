const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadsDir;

    // Create subdirectories based on file type
    if (file.fieldname === "avatar") {
      uploadPath = path.join(uploadsDir, "avatars");
    } else if (file.fieldname === "product_image") {
      uploadPath = path.join(uploadsDir, "products");
    } else if (file.fieldname === "service_image") {
      uploadPath = path.join(uploadsDir, "services");
    } else if (file.fieldname === "category_image") {
      uploadPath = path.join(uploadsDir, "categories");
    }

    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!"));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5, // Maximum 5 files
  },
  fileFilter: fileFilter,
});

// Middleware for single file upload
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            error: "File too large",
            message: "File size must be less than 5MB",
          });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            error: "Invalid file field",
            message: `Unexpected field: ${err.field}`,
          });
        }
        return res.status(400).json({
          error: "Upload error",
          message: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          error: "Upload error",
          message: err.message,
        });
      }
      next();
    });
  };
};

// Middleware for multiple file upload
const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            error: "File too large",
            message: "File size must be less than 5MB",
          });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            error: "Too many files",
            message: `Maximum ${maxCount} files allowed`,
          });
        }
        return res.status(400).json({
          error: "Upload error",
          message: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          error: "Upload error",
          message: err.message,
        });
      }
      next();
    });
  };
};

// Helper function to delete uploaded file
const deleteFile = (filepath) => {
  if (filepath && fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
};

// Helper function to get file URL
const getFileUrl = (req, filename) => {
  if (!filename) return null;
  return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  deleteFile,
  getFileUrl,
};
