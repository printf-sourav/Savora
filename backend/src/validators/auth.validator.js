import { body, oneOf } from "express-validator";

// TASK 5: Rules for POST /api/auth/register
export const registerRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),

  body("phone")
    .trim()
    .notEmpty().withMessage("Phone number is required")
    .matches(/^[6-9]\d{9}$/).withMessage("Please provide a valid 10-digit Indian phone number"),
];

// TASK 5: Rules for POST /api/auth/login
export const loginRules = [
  body("phone")
    .optional({ nullable: true })
    .trim(),

  body("email")
    .optional({ nullable: true })
    .trim()
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  oneOf([
    body("phone").notEmpty(),
    body("email").notEmpty(),
  ], "Mobile number or email is required"),

  body("password")
    .notEmpty().withMessage("Password is required"),
];

// TASK 4: Rules for POST /api/auth/forgot-password
export const forgotPasswordRules = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),
];

// TASK 4: Rules for POST /api/auth/reset-password/:token
export const resetPasswordRules = [
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
];
