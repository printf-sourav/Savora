import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Banner } from "../models/banner.model.js";
import { uploadOnCloudinary, cloudinary } from "../utils/cloudinary.js";

// @desc    Create a new banner
// @route   POST /api/admin/banners
// @access  Admin
export const createBanner = asyncHandler(async (req, res) => {
  const { title, subtitle, ctaText, ctaLink, isActive } = req.body;

  if (!title) throw new ApiError(400, "title is required");
  if (!req.file) throw new ApiError(400, "Banner image is required");

  // Upload to Cloudinary
  const uploaded = await uploadOnCloudinary(req.file.path);
  if (!uploaded) throw new ApiError(500, "Failed to upload image to Cloudinary");

  const shouldActivate = isActive === "true" || isActive === true;

  // If this banner is set as active, deactivate all others first
  if (shouldActivate) {
    await Banner.updateMany({}, { isActive: false });
  }

  const banner = await Banner.create({
    title,
    subtitle: subtitle || "",
    ctaText: ctaText || "Shop Now",
    ctaLink: ctaLink || "/shop",
    image: uploaded.secure_url,
    publicId: uploaded.public_id,
    isActive: shouldActivate,
  });

  return res.status(201).json(new ApiResponse(201, banner, "Banner created successfully"));
});

// @desc    Get all banners (admin)
// @route   GET /api/admin/banners
// @access  Admin
export const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort("-createdAt");
  return res.status(200).json(new ApiResponse(200, banners, "Banners fetched"));
});

// @desc    Get the single active banner (public)
// @route   GET /api/banners/active
// @access  Public
export const getActiveBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findOne({ isActive: true });
  return res.status(200).json(new ApiResponse(200, banner, "Active banner fetched"));
});

// @desc    Set a specific banner as active (deactivates all others)
// @route   PUT /api/admin/banners/:id/activate
// @access  Admin
export const toggleBannerActive = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) throw new ApiError(404, "Banner not found");

  // Deactivate all, then activate this one
  await Banner.updateMany({}, { isActive: false });
  banner.isActive = true;
  await banner.save();

  return res.status(200).json(new ApiResponse(200, banner, "Banner activated"));
});

// @desc    Delete a banner
// @route   DELETE /api/admin/banners/:id
// @access  Admin
export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) throw new ApiError(404, "Banner not found");

  // Destroy Cloudinary image
  if (banner.publicId && banner.publicId !== "placeholder") {
    await cloudinary.uploader.destroy(banner.publicId);
  }

  await Banner.findByIdAndDelete(req.params.id);
  return res.status(200).json(new ApiResponse(200, {}, "Banner deleted"));
});
