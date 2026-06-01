import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { admin, isFirebaseConfigured } from "../config/firebase.js";

// ─── Cookie options ─────────────────────────────────────────────────────────
const isProd = process.env.NODE_ENV === "production";

const accessTokenCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ─── Helper: generate tokens and set cookies ─────────────────────────────────
const issueTokensAndSetCookies = async (res, user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Persist hashed refresh token in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("accessToken", accessToken, accessTokenCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  return { accessToken, refreshToken };
};

// ─── REGISTER ────────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  if (phone) {
    const existingPhoneUser = await User.findOne({ phone });
    if (existingPhoneUser) {
      throw new ApiError(409, "Mobile number is already registered");
    }
  }

  const verificationToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.create({
    name,
    displayName: name,
    email,
    password,
    phone,
    verificationToken: hashedToken,
    verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
  });

  const verifyUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/login?verify=${verificationToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Verify your Savora account",
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto">
          <h2 style="color:#1E2B24">Welcome to Savora 🌿</h2>
          <p>Thanks for signing up! Please verify your email address by clicking the button below.</p>
          <a href="${verifyUrl}" style="display:inline-block;background:#1E2B24;color:#F5EFE4;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">Verify Email</a>
          <p style="color:#888;font-size:12px">This link expires in 24 hours. If you did not create an account, please ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(
      500,
      `Email could not be sent: ${error.message || "Unknown error"}`
    );
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {},
      "Registration successful. Please check your email (and spam folder) to verify your account."
    )
  );
});

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────
// @route   GET /api/auth/verify-email/:token
export const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token");
  }

  user.isEmailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Email verified successfully. You can now log in.")
  );
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;
  const phoneValue = typeof phone === "string" ? phone.trim() : "";
  const normalizedDigits = phoneValue.replace(/\D/g, "");

  let user = null;
  if (phoneValue) {
    user = await User.findOne({
      $or: [
        { phone: phoneValue },
        { phone: normalizedDigits },
        { phone: normalizedDigits ? `+${normalizedDigits}` : phoneValue },
      ],
    });
  }

  if (!user && email) {
    user = await User.findOne({ email });
  }

  if (!user) {
    throw new ApiError(401, "Invalid mobile number/email or password");
  }

  if (user.isBlocked) {
    throw new ApiError(403, "Your account has been blocked. Contact support.");
  }

  if (!user.isEmailVerified && user.role !== "ADMIN") {
    throw new ApiError(403, "Please verify your email address before logging in");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  // TASK 1: Issue tokens as httpOnly cookies — NOT in response body
  await issueTokensAndSetCookies(res, user);

  const loggedInUser = {
    _id: user._id,
    name: user.name,
    displayName: user.displayName || user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
  };

  return res.status(200).json(
    new ApiResponse(200, { user: loggedInUser }, "User logged in successfully")
  );
});

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
// @route   POST /api/auth/logout
export const logoutUser = asyncHandler(async (req, res) => {
  // Clear refresh token from DB
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

  res.clearCookie("accessToken", accessTokenCookieOptions);
  res.clearCookie("refreshToken", refreshTokenCookieOptions);

  return res.status(200).json(new ApiResponse(200, {}, "Logged out successfully"));
});

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
// @route   POST /api/auth/refresh-token
// TASK 2: Read refreshToken cookie, verify, issue new accessToken cookie
export const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token not found");
  }

  let decoded;
  try {
    decoded = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_SECRET
    );
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded._id);
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  // Confirm stored refresh token matches the incoming one
  if (user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token has been revoked");
  }

  if (user.isBlocked) {
    throw new ApiError(403, "Your account has been blocked");
  }

  // Issue fresh access token only
  const newAccessToken = user.generateAccessToken();
  res.cookie("accessToken", newAccessToken, accessTokenCookieOptions);

  return res.status(200).json(
    new ApiResponse(200, {}, "Access token refreshed successfully")
  );
});

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
// @route   POST /api/auth/forgot-password
// TASK 4
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // Always return success to prevent user enumeration attacks
  if (!user) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {},
        "If that email is registered, a reset link has been sent."
      )
    );
  }

  const rawToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${rawToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Savora — Password Reset Request",
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto">
          <h2 style="color:#1E2B24">Reset Your Password 🔐</h2>
          <p>We received a request to reset your Savora account password.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#1E2B24;color:#F5EFE4;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">Reset Password</a>
          <p style="color:#888;font-size:12px">This link expires in 1 hour. If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(
      500,
      `Could not send reset email: ${error.message || "Unknown error"}`
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "If that email is registered, a reset link has been sent."
    )
  );
});

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
// @route   POST /api/auth/reset-password/:token
// TASK 4
export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired password reset token");
  }

  // The pre-save bcrypt hook will hash this automatically
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();

  // Issue new cookies so user is logged in immediately after reset
  await issueTokensAndSetCookies(res, user);

  return res.status(200).json(
    new ApiResponse(200, {}, "Password reset successfully. You are now logged in.")
  );
});

// ─── GET PROFILE ─────────────────────────────────────────────────────────────
// @route   GET /api/auth/profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken -verificationToken -verificationTokenExpiry -resetPasswordToken -resetPasswordExpiry"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, user, "Profile fetched successfully")
  );
});

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
// @route   PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, displayName, phone, currentPassword, newPassword, confirmPassword } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (name) user.name = name;
  if (displayName !== undefined) user.displayName = displayName;
  if (phone && phone !== user.phone) {
    const existingPhoneUser = await User.findOne({ phone });
    if (existingPhoneUser && existingPhoneUser._id.toString() !== user._id.toString()) {
      throw new ApiError(409, "Mobile number is already registered");
    }

    user.phone = phone;
  }

  if (newPassword || confirmPassword || currentPassword) {
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new ApiError(400, "currentPassword, newPassword, and confirmPassword are required to change your password");
    }

    if (newPassword !== confirmPassword) {
      throw new ApiError(400, "New password and confirm password do not match");
    }

    const isCurrentPasswordValid = await user.isPasswordCorrect(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new ApiError(401, "Current password is incorrect");
    }

    user.password = newPassword;
  }

  await user.save();

  const updatedUser = await User.findById(user._id).select(
    "-password -refreshToken -verificationToken -verificationTokenExpiry -resetPasswordToken -resetPasswordExpiry"
  );

  return res.status(200).json(
    new ApiResponse(200, updatedUser, "Profile updated successfully")
  );
});

// ─── ADDRESS BOOK (TASK 3) ────────────────────────────────────────────────────

// @route   POST /api/auth/addresses
export const addAddress = asyncHandler(async (req, res) => {
  const { street, city, state, country, pincode, isDefault } = req.body;

  if (!street || !city || !state || !country || !pincode) {
    throw new ApiError(400, "street, city, state, country, and pincode are required");
  }

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  // If new address is default, unset all existing defaults
  if (isDefault) {
    user.addresses.forEach((addr) => { addr.isDefault = false; });
  }

  user.addresses.push({ street, city, state, country, pincode, isDefault: !!isDefault });
  await user.save();

  return res.status(201).json(
    new ApiResponse(201, user.addresses, "Address added successfully")
  );
});

// @route   PUT /api/auth/addresses/:addressId
export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  const address = user.addresses.id(req.params.addressId);
  if (!address) throw new ApiError(404, "Address not found");

  const { street, city, state, country, pincode, isDefault } = req.body;
  if (street) address.street = street;
  if (city) address.city = city;
  if (state) address.state = state;
  if (country) address.country = country;
  if (pincode) address.pincode = pincode;
  if (isDefault !== undefined) {
    if (isDefault) user.addresses.forEach((a) => { a.isDefault = false; });
    address.isDefault = !!isDefault;
  }

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, user.addresses, "Address updated successfully")
  );
});

// @route   DELETE /api/auth/addresses/:addressId
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  const address = user.addresses.id(req.params.addressId);
  if (!address) throw new ApiError(404, "Address not found");

  address.deleteOne();
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, user.addresses, "Address deleted successfully")
  );
});

// @route   PUT /api/auth/addresses/:addressId/default
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  const address = user.addresses.id(req.params.addressId);
  if (!address) throw new ApiError(404, "Address not found");

  user.addresses.forEach((a) => { a.isDefault = false; });
  address.isDefault = true;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, user.addresses, "Default address updated")
  );
});

// ─── WISHLIST (TASK 4) ────────────────────────────────────────────────────────

// @route   POST /api/auth/wishlist/:productId
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  const alreadyIn = user.wishlist.some((id) => id.toString() === productId);
  if (!alreadyIn) {
    await User.findByIdAndUpdate(req.user._id, { $push: { wishlist: productId } });
  }

  const updated = await User.findById(req.user._id)
    .select("wishlist")
    .populate("wishlist", "title slug price discountPrice images ratings");

  return res.status(200).json(
    new ApiResponse(200, updated.wishlist, "Added to wishlist")
  );
});

// @route   DELETE /api/auth/wishlist/:productId
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  await User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: productId } });

  const updated = await User.findById(req.user._id)
    .select("wishlist")
    .populate("wishlist", "title slug price discountPrice images ratings");

  return res.status(200).json(
    new ApiResponse(200, updated.wishlist, "Removed from wishlist")
  );
});

// ─── CART SYNC (TASK 6) ───────────────────────────────────────────────────────

// @route   PUT /api/auth/cart
export const syncCart = asyncHandler(async (req, res) => {
  const { cart } = req.body; // Array of { product: ObjectId, quantity: Number, variant: String }

  if (!Array.isArray(cart)) throw new ApiError(400, "cart must be an array");

  await User.findByIdAndUpdate(req.user._id, { cart });

  return res.status(200).json(
    new ApiResponse(200, cart, "Cart synced successfully")
  );
});

// @route   GET /api/auth/cart
export const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("cart")
    .populate("cart.product", "title slug price discountPrice images");

  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(
    new ApiResponse(200, user.cart, "Cart fetched")
  );
});


// ─── Firebase Login ─────────────────────────────────────────────────────────────
export const firebaseLogin = asyncHandler(async (req, res) => {
  if (!isFirebaseConfigured) {
    throw new ApiError(500, "Firebase Admin is not configured on the server.");
  }
  const { idToken, phoneNumber } = req.body;
  if (!idToken) throw new ApiError(400, "idToken is required");

  const providedPhoneNumber = typeof phoneNumber === "string" ? phoneNumber.trim() : "";

  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    console.error("Firebase ID Token verification failed:", error);
    throw new ApiError(401, "Invalid Firebase ID Token: " + error.message);
  }

  const { email, phone_number, name } = decodedToken;
  const effectivePhoneNumber = phone_number || providedPhoneNumber;
  
  if (!email && !effectivePhoneNumber) {
    throw new ApiError(400, "Firebase token must contain either email or phone number.");
  }

  // 1. Try to link to currently logged in user
  let user = null;
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  if (token) {
    try {
      const decodedJWT = jwt.verify(token, process.env.JWT_SECRET);
      user = await User.findById(decodedJWT._id);
    } catch(e) { }
  }

  // 1b. If not logged in, find by email or phone
  if (!user && email) {
    user = await User.findOne({ email });
  } 
  if (!user && effectivePhoneNumber) {
    const rawNumber = effectivePhoneNumber.replace(/^\+\d{2,3}/, '').trim();
    user = await User.findOne({ 
      $or: [
        { phone: effectivePhoneNumber },
        { phone: rawNumber }
      ]
    });
  }

  // 2. If user doesn't exist, create one
  if (!user) {
    // Generate a random password since one is required by our schema
    const randomPassword = crypto.randomBytes(20).toString('hex');
    user = await User.create({
      name: name || (email ? email.split('@')[0] : "User"),
      displayName: name || (email ? email.split('@')[0] : "User"),
      email: email || `${effectivePhoneNumber.replace('+', '')}@phone-auth.savora.local`,
      phone: effectivePhoneNumber || undefined,
      password: randomPassword,
      isEmailVerified: !!email,
    });
  } else {
    // If the caller supplied a phone number for OAuth, store it.
    if (providedPhoneNumber && providedPhoneNumber !== user.phone) {
      user.phone = providedPhoneNumber;
      await user.save({ validateBeforeSave: false });
    }

    // Same for email
    if (email && !user.isEmailVerified) {
      user.isEmailVerified = true;
      await user.save({ validateBeforeSave: false });
    }
  }

  // 3. Issue our JWT exactly like regular login
  const { accessToken, refreshToken } = await issueTokensAndSetCookies(res, user);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          _id: user._id,
          name: user.name,
          displayName: user.displayName || user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified
        },
        accessToken,
      },
      "Logged in via Firebase successfully"
    )
  );
});

