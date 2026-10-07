import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
  "PORT",
  "MONGO_URL",
  "REDIS_URL",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET"
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(
      `${key} is not defined in environment variables`
    );
  }
}

export const configs = {
  PORT: process.env.PORT,
  MONGO_URL: process.env.MONGO_URL,

  // Redis
  REDIS_URL: process.env.REDIS_URL,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_REGISTRATION_SECRET: process.env.ADMIN_REGISTRATION_SECRET,

  // Cloudinary
  CLOUDINARY_CLOUD_NAME:
    process.env.CLOUDINARY_CLOUD_NAME,

  CLOUDINARY_API_KEY:
    process.env.CLOUDINARY_API_KEY,

  CLOUDINARY_API_SECRET:
    process.env.CLOUDINARY_API_SECRET,

  // Email
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,

  // Environment
  NODE_ENV: process.env.NODE_ENV || "development",

  // Gemini
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  //razopay

  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,

  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET
};
