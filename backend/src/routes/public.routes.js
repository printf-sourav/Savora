import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Coupon } from "../models/coupon.model.js";
import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";

const router = Router();

/**
 * POST /api/validate-coupon
 * Public — no auth required.
 * Body: { code: string, orderValue: number }
 */
router.post(
  "/validate-coupon",
  asyncHandler(async (req, res) => {
    const { code, orderValue } = req.body;

    if (!code) {
      throw new ApiError(400, "Coupon code is required");
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      throw new ApiError(404, "Invalid coupon code");
    }

    if (!coupon.activeStatus) {
      throw new ApiError(400, "Coupon is inactive");
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      throw new ApiError(400, "Coupon has expired");
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new ApiError(400, "Coupon usage limit has been reached");
    }

    if (coupon.minimumOrderValue && orderValue < coupon.minimumOrderValue) {
      throw new ApiError(400, `Minimum order value of ₹${coupon.minimumOrderValue} required`);
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          code: coupon.code,
          discountPercentage: coupon.discountPercentage,
        },
        "Coupon is valid"
      )
    );
  })
);

router.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const categories = await Category.find().sort("name");
    
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat._id, isActive: true });
        return {
          ...cat.toObject(),
          itemCount: count,
        };
      })
    );

    return res.status(200).json(
      new ApiResponse(200, categoriesWithCount, "Categories fetched")
    );
  })
);

export default router;
