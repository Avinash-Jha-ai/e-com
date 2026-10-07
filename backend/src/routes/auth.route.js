
import express from "express";

import {
    register,
    verifyRegisterOTP,
    login,
    getMe,
    sendChangePasswordOTP,
    changePassword,
    addAddress,
    logout
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
    verifyRegisterOTPValidator
} from "../validators/auth.validator.js";

const router = express.Router();


// =====================================================
// ADMIN REGISTRATION SECURITY
// Only used when creating an admin account
// =====================================================

const requireAdminRegistrationSecret = (req, res, next) => {
    const secret = configs.ADMIN_REGISTRATION_SECRET;
    const suppliedSecret = req.get("x-admin-registration-secret");

    if (!secret || suppliedSecret !== secret) {
        return res.status(403).json({
            success: false,
            message: "Admin registration is not authorized"
        });
    }

    next();
};


// =====================================================
// USER AUTHENTICATION
// These APIs are for normal users
// =====================================================

// Register normal user
router.post(
    "/register",
    authLimiter,
    upload.single("avatar"),
    registerValidator,
    validateRequest,
    (req, res, next) => {
        req.authRole = "user";
        next();
    },
    register
);

// Verify normal user's registration OTP
router.post(
    "/register/verify",
    authLimiter,
    verifyRegisterOTPValidator,
    validateRequest,
    (req, res, next) => {
        req.authRole = "user";
        next();
    },
    verifyRegisterOTP
);

// Login normal user
router.post(
    "/login",
    authLimiter,
    loginValidator,
    validateRequest,
    (req, res, next) => {
        req.authRole = "user";
        next();
    },
    login
);


// =====================================================
// SHOPKEEPER AUTHENTICATION
// These APIs are for sellers/shopkeepers
// =====================================================

// Register shopkeeper
router.post(
    "/register/shopkeeper",
    authLimiter,
    upload.single("avatar"),
    registerValidator,
    validateRequest,
    (req, res, next) => {
        req.authRole = "shopkeeper";
        next();
    },
    register
);

// Verify shopkeeper's registration OTP
router.post(
    "/register/shopkeeper/verify",
    authLimiter,
    verifyRegisterOTPValidator,
    validateRequest,
    (req, res, next) => {
        req.authRole = "shopkeeper";
        next();
    },
    verifyRegisterOTP
);

// Login shopkeeper
router.post(
    "/login/shopkeeper",
    authLimiter,
    loginValidator,
    validateRequest,
    (req, res, next) => {
        req.authRole = "shopkeeper";
        next();
    },
    login
);


// =====================================================
// ADMIN AUTHENTICATION
// These APIs are only for administrators
// =====================================================

// Register admin
// Requires x-admin-registration-secret header
router.post(
    "/register/admin",
    authLimiter,
    requireAdminRegistrationSecret,
    upload.single("avatar"),
    registerValidator,
    validateRequest,
    (req, res, next) => {
        req.authRole = "admin";
        next();
    },
    register
);

// Verify admin's registration OTP
router.post(
    "/register/admin/verify",
    authLimiter,
    verifyRegisterOTPValidator,
    validateRequest,
    (req, res, next) => {
        req.authRole = "admin";
        next();
    },
    verifyRegisterOTP
);

// Login admin
router.post(
    "/login/admin",
    authLimiter,
    loginValidator,
    validateRequest,
    (req, res, next) => {
        req.authRole = "admin";
        next();
    },
    login
);


// =====================================================
// COMMON AUTHENTICATED APIs
// These APIs can be used by logged-in users
// =====================================================

// Logout current user
router.post(
    "/logout",
    isAuthenticated,
    logout
);

// Get currently logged-in user's information
router.get(
    "/me",
    isAuthenticated,
    getMe
);


// =====================================================
// PASSWORD MANAGEMENT
// These APIs are for logged-in users
// =====================================================

// Send OTP for changing password
router.get(
    "/change-password/otp",
    isAuthenticated,
    authLimiter,
    sendChangePasswordOTP
);

// Change password
router.put(
    "/change-password",
    isAuthenticated,
    authLimiter,
    changePasswordValidator,
    validateRequest,
    changePassword
);


// =====================================================
// ADDRESS MANAGEMENT
// These APIs are for logged-in users
// =====================================================

// Add new address
router.post(
    "/address",
    isAuthenticated,
    addressValidator,
    validateRequest,
    addAddress
);


export default router;
