import express from "express";
import rateLimit from "express-rate-limit";
import {
  loginUser, registerUser, logoutUser, verifyEmail,
  refreshToken, forgotPassword, resetPassword,
  getProfile, updateProfile,
  addAddress, updateAddress, deleteAddress, setDefaultAddress,
  addToWishlist, removeFromWishlist,
  syncCart, getCart,
  firebaseLogin
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { loginRules, registerRules, forgotPasswordRules, resetPasswordRules } from "../validators/auth.validator.js";

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many registration attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

// Public routes
router.post("/firebase-login", loginLimiter, firebaseLogin);
router.post("/login", loginLimiter, loginRules, validate, loginUser);
router.post("/register", registerLimiter, registerRules, validate, registerUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPasswordRules, validate, forgotPassword);
router.post("/reset-password/:token", resetPasswordRules, validate, resetPassword);

// Protected routes
router.post("/logout", verifyJWT, logoutUser);
router.get("/profile", verifyJWT, getProfile);
router.put("/profile", verifyJWT, updateProfile);

// Address book
router.post("/addresses", verifyJWT, addAddress);
router.put("/addresses/:addressId", verifyJWT, updateAddress);
router.delete("/addresses/:addressId", verifyJWT, deleteAddress);
router.put("/addresses/:addressId/default", verifyJWT, setDefaultAddress);

// Wishlist (TASK 4)
router.post("/wishlist/:productId", verifyJWT, addToWishlist);
router.delete("/wishlist/:productId", verifyJWT, removeFromWishlist);

// Cart sync
router.get("/cart", verifyJWT, getCart);
router.put("/cart", verifyJWT, syncCart);

export default router;
