import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// TASK 4: Full rewrite with search, filter, sort, pagination
// @desc    Fetch products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const {
    search, category, minPrice, maxPrice,
    sort, page = 1, limit = 12, featured, bestseller,
  } = req.query;

  const filter = { isActive: true };

  // Full-text search using $text index (title + shortDescription)
  if (search) {
    filter.$text = { $search: search };
  }

  // Category filter (ObjectId)
  if (category) {
    filter.category = category;
  }

  // Price range
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Boolean filters
  if (featured === "true") filter.featured = true;
  if (bestseller === "true") filter.bestseller = true;

  // Sort map
  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { ratings: -1 },
  };
  const sortOption = sortMap[sort] || { createdAt: -1 };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      products,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    }, "Products fetched successfully")
  );
});

// TASK 4: Fetch single product by slug
// @desc    Fetch single product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate(
    "category", "name slug"
  );

  if (product) {
    res.status(200).json(new ApiResponse(200, product, "Product fetched successfully"));
  } else {
    throw new ApiError(404, "Product not found");
  }
});
