import { body } from "express-validator";

const passwordRules = body("password")
  .isString()
  .withMessage("Password must be a string")
  .isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  .withMessage(
    "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol"
  );

const emailRule = body("email")
  .isString()
  .withMessage("Email must be a string")
  .trim()
  .isEmail()
  .withMessage("A valid email is required")
  .normalizeEmail();

const otpRule = body("otp")
  .isString()
  .withMessage("OTP must be a string")
  .matches(/^\d{6}$/)
  .withMessage("OTP must contain exactly 6 digits");

export const registerValidator = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be between 2 and 80 characters"),
  emailRule,
  passwordRules,
];

export const verifyRegisterOTPValidator = [emailRule, otpRule];

export const loginValidator = [emailRule, passwordRules];

export const changePasswordValidator = [
  otpRule,
  body("newPassword")
    .isString()
    .withMessage("New password must be a string")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "New password must be at least 8 characters and include uppercase, lowercase, number, and symbol"
    ),
];

export const addressValidator = [
  body("fullName").isString().trim().isLength({ min: 2, max: 80 }),
  body("phone").isString().trim().matches(/^\+?[1-9]\d{7,14}$/),
  body("addressLine1").isString().trim().isLength({ min: 3, max: 160 }),
  body("addressLine2").optional().isString().trim().isLength({ max: 160 }),
  body("city").isString().trim().isLength({ min: 2, max: 80 }),
  body("state").isString().trim().isLength({ min: 2, max: 80 }),
  body("postalCode").isString().trim().isLength({ min: 3, max: 20 }),
  body("country").optional().isString().trim().isLength({ min: 2, max: 80 }),
  body("isDefault").optional().isBoolean().toBoolean(),
];
