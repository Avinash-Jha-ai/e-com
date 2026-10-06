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

  console.error(error);
  return res.status(500).json({ success: false, message: "Internal server error" });
};
