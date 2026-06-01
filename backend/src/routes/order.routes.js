import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
} from "../controllers/order.controller.js";
import { verifyJWT } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { createOrderRules } from "../validators/order.validator.js";

const router = express.Router();

// All order routes require authentication
router.use(verifyJWT);

// TASK 5: Apply createOrderRules validation to POST /
router.post("/", createOrderRules, validate, createOrder);
router.get("/my", getUserOrders);
router.get("/:id", getOrderById);
router.put("/:id/cancel", cancelOrder);

export default router;
