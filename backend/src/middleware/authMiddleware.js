import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// TASK 1: Read from httpOnly cookie; keep Authorization header as fallback for API clients
export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized — No token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }

  const user = await User.findById(decoded._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(401, "Unauthorized — User not found");
  }

  if (user.isBlocked) {
    throw new ApiError(403, "Your account has been blocked");
  }

  req.user = user;
  next();
});

// Check if user is ADMIN
export const isAdmin = asyncHandler(async (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    throw new ApiError(403, "Access denied — Admin only");
  }
  next();
});
