import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Coupon } from "../models/coupon.model.js";
import { User } from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";
import { orderConfirmedTemplate } from "../templates/orderConfirmed.js";
import { orderCancelledTemplate } from "../templates/orderCancelledTemplate.js";

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const {
    orderedItems,
    shippingAddress,
    paymentMethod,
    totalAmount,
    shippingCharge,
    couponDiscount,
    couponCode,
  } = req.body;

  if (!orderedItems || orderedItems.length === 0) {
    throw new ApiError(400, "No items in order");
  }
  if (!shippingAddress || !paymentMethod || totalAmount === undefined) {
    throw new ApiError(400, "shippingAddress, paymentMethod, and totalAmount are required");
  }

  // Validate payment method
  const validPaymentMethods = ["COD", "ONLINE"];
  if (!validPaymentMethods.includes(paymentMethod.toUpperCase())) {
    throw new ApiError(400, `paymentMethod must be one of: ${validPaymentMethods.join(", ")}`);
  }

  // Validate each product exists, has enough stock, and compute server-side total
  let serverSubtotal = 0;
  for (const item of orderedItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new ApiError(404, `Product not found: ${item.product}`);
    }
    if (product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for "${product.title}". Available: ${product.stock}`);
    }
    // Use discountPrice when set, otherwise fall back to price
    const unitPrice = product.discountPrice || product.price;
    serverSubtotal += unitPrice * item.quantity;
  }

  const serverTotal = serverSubtotal + (shippingCharge || 0) - (couponDiscount || 0);

  // Guard against client-side price tampering (₹1 floating-point tolerance)
  if (Math.abs(serverTotal - totalAmount) > 1) {
    throw new ApiError(
      400,
      `Order total mismatch. Expected ₹${serverTotal.toFixed(2)}, received ₹${Number(totalAmount).toFixed(2)}`
    );
  }

  // Create the order — always persist the server-computed total
  const order = await Order.create({
    userId: req.user._id,
    orderedItems,
    shippingAddress,
    paymentMethod: paymentMethod.toUpperCase(),
    totalAmount: serverTotal,
    shippingCharge: shippingCharge || 0,
    couponDiscount: couponDiscount || 0,
  });

  // Decrement stock for each product
  for (const item of orderedItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  // Push order ID to user's orders array and clear their cart
  await User.findByIdAndUpdate(req.user._id, {
    $push: { orders: order._id },
    $set: { cart: [] },
  });

  // Increment coupon usageCount if a coupon was applied
  if (couponCode) {
    await Coupon.findOneAndUpdate(
      { code: couponCode.toUpperCase() },
      { $inc: { usageCount: 1 } }
    );
  }

  // TASK 1: Send order confirmation email (non-blocking)
  sendEmail({
    email: req.user.email,
    subject: `Order Confirmed — Savora #${order._id.toString().slice(-8).toUpperCase()}`,
    html: orderConfirmedTemplate(order, req.user),
  }).catch((err) => console.error("Order confirm email failed:", err.message));

  return res.status(201).json(
    new ApiResponse(201, order, "Order placed successfully")
  );
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
// @access  Private
export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id })
    .populate("orderedItems.product", "title images slug")
    .sort("-createdAt");

  return res.status(200).json(
    new ApiResponse(200, orders, "Orders fetched successfully")
  );
});

// @desc    Get a single order by ID
// @route   GET /api/orders/:id
// @access  Private (owner or admin)
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("orderedItems.product", "title images slug")
    .populate("userId", "name email phone");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Only the owner or an admin can view the order
  if (
    order.userId._id.toString() !== req.user._id.toString() &&
    req.user.role !== "ADMIN"
  ) {
    throw new ApiError(403, "Not authorized to view this order");
  }

  return res.status(200).json(
    new ApiResponse(200, order, "Order fetched successfully")
  );
});

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private (owner only)
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to cancel this order");
  }

  if (order.orderStatus !== "PROCESSING") {
    throw new ApiError(
      400,
      `Cannot cancel order. Current status: "${order.orderStatus}". Only PROCESSING orders can be cancelled.`
    );
  }

  // Restore stock for each item
  for (const item of order.orderedItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  order.orderStatus = "CANCELLED";
  if (order.paymentStatus === "COMPLETED") {
    order.paymentStatus = "REFUNDED";
  }
  await order.save();

  // TASK 2: Send cancellation email
  const user = await User.findById(order.userId).select('name email');
  sendEmail({
    email: user.email,
    subject: `Order Cancelled — Savora #${order._id.toString().slice(-8).toUpperCase()}`,
    html: orderCancelledTemplate(order, user),
  }).catch((err) => console.error("Cancel email error:", err.message));

  return res.status(200).json(
    new ApiResponse(200, order, "Order cancelled successfully")
  );
});
