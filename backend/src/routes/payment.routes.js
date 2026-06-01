import express from "express";
import { createRazorpayOrder, verifyPayment } from "../controllers/payment.controller.js";
import { verifyJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

// All payment routes require authentication
router.use(verifyJWT);

router.post("/create-order", createRazorpayOrder);
router.post("/verify", verifyPayment);

export default router;
