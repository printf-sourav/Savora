import Razorpay from "razorpay";
import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";

// Razorpay instance
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new ApiError(500, "Razorpay credentials not configured");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc    Create a Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, orderId } = req.body;

  if (!amount || !orderId) {
    throw new ApiError(400, "amount and orderId are required");
  }

  const razorpay = getRazorpayInstance();

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(amount * 100), // convert to paise
    currency: "INR",
    receipt: orderId.toString(),
  });

  return res.status(200).json(
    new ApiResponse(200, {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    }, "Razorpay order created")
  );
});

// @desc    Verify Razorpay payment signature and mark order as paid
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    orderId,
  } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
    throw new ApiError(400, "All payment fields are required");
  }

  // HMAC SHA256 signature verification
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new ApiError(400, "Invalid payment signature");
  }

  // Mark order as paid
  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      paymentStatus: "COMPLETED",
      paymentId: razorpayPaymentId,
    },
    { new: true }
  );

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res.status(200).json(
    new ApiResponse(200, { order }, "Payment verified and order updated successfully")
  );
});
