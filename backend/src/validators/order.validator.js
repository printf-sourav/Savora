import { body } from "express-validator";

// TASK 5: Rules for POST /api/orders
export const createOrderRules = [
  body("orderedItems")
    .isArray({ min: 1 }).withMessage("orderedItems must be a non-empty array"),

  body("orderedItems.*.product")
    .notEmpty().withMessage("Each item must have a product ID")
    .isMongoId().withMessage("Each item must have a valid product ID"),

  body("orderedItems.*.quantity")
    .isInt({ min: 1 }).withMessage("Each item quantity must be at least 1"),

  body("orderedItems.*.price")
    .isFloat({ min: 0 }).withMessage("Each item price must be a non-negative number"),

  body("shippingAddress.street")
    .trim()
    .notEmpty().withMessage("Shipping street address is required"),

  body("shippingAddress.city")
    .trim()
    .notEmpty().withMessage("Shipping city is required"),

  body("shippingAddress.state")
    .trim()
    .notEmpty().withMessage("Shipping state is required"),

  body("shippingAddress.country")
    .trim()
    .notEmpty().withMessage("Shipping country is required"),

  body("shippingAddress.pincode")
    .trim()
    .notEmpty().withMessage("Shipping pincode is required")
    .matches(/^\d{4,10}$/).withMessage("Shipping pincode must be 4-10 digits"),

  body("paymentMethod")
    .trim()
    .notEmpty().withMessage("Payment method is required")
    .toUpperCase()
    .isIn(["COD", "ONLINE"]).withMessage("paymentMethod must be COD or ONLINE"),

  body("totalAmount")
    .isFloat({ min: 0 }).withMessage("totalAmount must be a non-negative number"),
];
