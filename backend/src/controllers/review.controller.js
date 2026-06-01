import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Review } from "../models/review.model.js";
import { Product } from "../models/product.model.js";
import mongoose from "mongoose";

// @desc    Create a review for a product
// @route   POST /api/products/:id/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    throw new ApiError(400, "Rating and comment are required");
  }
  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check for duplicate review
  const existing = await Review.findOne({
    user: req.user._id,
    product: req.params.id,
  });
  if (existing) {
    throw new ApiError(400, "You have already reviewed this product");
  }

  const review = await Review.create({
    user: req.user._id,
    product: req.params.id,
    rating: Number(rating),
    comment,
  });

  // Push review ID to product's reviews array
  await Product.findByIdAndUpdate(req.params.id, {
    $push: { reviews: review._id },
  });

  const populatedReview = await Review.findById(review._id).populate(
    "user",
    "name avatar"
  );

  return res.status(201).json(
    new ApiResponse(201, populatedReview, "Review submitted successfully")
  );
});

// @desc    Get all reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
export const getProductReviews = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const reviews = await Review.find({ product: req.params.id })
    .populate("user", "name avatar")
    .sort("-createdAt");

  return res.status(200).json(
    new ApiResponse(200, reviews, "Reviews fetched successfully")
  );
});

// @desc    Delete a review (owner or admin)
// @route   DELETE /api/reviews/:reviewId
// @access  Private
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (
    review.user.toString() !== req.user._id.toString() &&
    req.user.role !== "ADMIN"
  ) {
    throw new ApiError(403, "Not authorized to delete this review");
  }

  const productId = review.product;

  await Review.findByIdAndDelete(req.params.reviewId);

  // Remove review ID from product's reviews array
  await Product.findByIdAndUpdate(productId, {
    $pull: { reviews: review._id },
  });

  // Recalculate average rating
  const remaining = await Review.find({ product: productId });
  const avgRating =
    remaining.length > 0
      ? remaining.reduce((acc, r) => acc + r.rating, 0) / remaining.length
      : 0;

  await Product.findByIdAndUpdate(productId, { ratings: avgRating });

  return res.status(200).json(
    new ApiResponse(200, {}, "Review deleted successfully")
  );
});
