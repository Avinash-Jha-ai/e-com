// middleware/upload.middleware.js

import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, callback) => {
    if (file.mimetype.startsWith("image/")) return callback(null, true);
    return callback(new Error("Only image files are allowed"));
  },
});

export default upload;
