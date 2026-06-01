import express from "express";
import {
  createReview,
  getProductReviews,
  deleteReview,
} from "../controllers/review.controller.js";
import { verifyJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

// Product review routes — nested under /api/products/:id
router.get("/products/:id/reviews", getProductReviews);
router.post("/products/:id/reviews", verifyJWT, createReview);

// Review-specific routes
router.delete("/reviews/:reviewId", verifyJWT, deleteReview);

export default router;
