import multer from "multer";

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error instanceof multer.MulterError) {
    const message = error.code === "LIMIT_FILE_SIZE"
      ? "Avatar must be 5 MB or smaller"
      : "Invalid file upload";
    return res.status(400).json({ success: false, message });
  }

  if (error.message === "Only image files are allowed") {
    return res.status(400).json({ success: false, message: error.message });
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid format for field: ${error.path}`,
    });
  }

  // Handle Mongoose Validation Error
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors || {}).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(", ") || "Validation error",
    });
  }

  // Handle MongoDB Duplicate Key Error
  if (error.code === 11000) {
    const duplicateFields = Object.keys(error.keyPattern || {}).join(", ");
    return res.status(409).json({
      success: false,
      message: `Duplicate entry for: ${duplicateFields || "field"}`,
    });
  }

  // Handle JWT Errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token has expired" });
  }

  console.error("Unhandled Server Error:", error);
  return res.status(500).json({ success: false, message: "Internal server error" });
};

