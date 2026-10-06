import express from "express";

import {
  register,
  verifyRegisterOTP,
  login,
  getMe,
  sendChangePasswordOTP,
  changePassword,
  addAddress,
  logout,
} from "../controllers/auth.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";

import upload from "../middlewares/upload.middleware.js";
import { authLimiter } from "../middlewares/rate-limit.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  addressValidator,
  changePasswordValidator,
  loginValidator,
  registerValidator,
  verifyRegisterOTPValidator,
} from "../validators/auth.validator.js";

const router = express.Router();


// Authentication
router.post(
  "/register",
  authLimiter,
  upload.single("avatar"),
  registerValidator,
  validateRequest,
  register
);

router.post(
  "/register/verify",
  authLimiter,
  verifyRegisterOTPValidator,
  validateRequest,
  verifyRegisterOTP
);

router.post(
  "/login",
  authLimiter,
  loginValidator,
  validateRequest,
  login
);

router.post(
  "/logout",
  isAuthenticated,
  logout
);


// Protected routes
router.post(
  "/me",
  isAuthenticated,
  getMe
);

router.get(
  "/change-password/otp",
  isAuthenticated,
  authLimiter,
  sendChangePasswordOTP
);

router.put(
  "/change-password",
  isAuthenticated,
  authLimiter,
  changePasswordValidator,
  validateRequest,
  changePassword
);

router.post(
  "/address",
  isAuthenticated,
  addressValidator,
  validateRequest,
  addAddress
);

export default router;
