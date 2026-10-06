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
import { configs } from "../configs/config.js";

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

const useRole = (role) => (req, res, next) => {
  req.authRole = role;
  next();
};

const requireAdminRegistrationSecret = (req, res, next) => {
  const configuredSecret = configs.ADMIN_REGISTRATION_SECRET;
  const suppliedSecret = req.get("x-admin-registration-secret");

  if (!configuredSecret || suppliedSecret !== configuredSecret) {
    return res.status(403).json({
      success: false,
      message: "Admin registration is not authorized",
    });
  }

  next();
};

const registerRoute = (path, role, ...guards) => router.post(
  path,
  authLimiter,
  ...guards,
  useRole(role),
  upload.single("avatar"),
  registerValidator,
  validateRequest,
  register
);

const verifyRegistrationRoute = (path, role) => router.post(
  path,
  authLimiter,
  useRole(role),
  verifyRegisterOTPValidator,
  validateRequest,
  verifyRegisterOTP
);

const loginRoute = (path, role) => router.post(
  path,
  authLimiter,
  useRole(role),
  loginValidator,
  validateRequest,
  login
);

// Authentication
// User endpoints retain the original URLs for backwards compatibility.
registerRoute("/register", "user");
verifyRegistrationRoute("/register/verify", "user");
loginRoute("/login", "user");

registerRoute("/register/shopkeeper", "shopkeeper");
verifyRegistrationRoute("/register/shopkeeper/verify", "shopkeeper");
loginRoute("/login/shopkeeper", "shopkeeper");

// Never expose an unrestricted public path for creating privileged accounts.
registerRoute("/register/admin", "admin", requireAdminRegistrationSecret);
verifyRegistrationRoute("/register/admin/verify", "admin");
loginRoute("/login/admin", "admin");

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
