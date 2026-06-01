import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { Coupon } from "../models/coupon.model.js";
import { Category } from "../models/category.model.js";
import { uploadOnCloudinary, cloudinary } from "../utils/cloudinary.js";
import sendEmail from "../utils/sendEmail.js";
import { orderShippedTemplate } from "../templates/orderShipped.js";
import { orderDeliveredTemplate } from "../templates/orderDelivered.js";

// ========================
// DASHBOARD STATS
// ========================

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalProducts, totalOrders, totalCoupons] =
    await Promise.all([
      User.countDocuments({ role: "USER" }),
      Product.countDocuments(),
      Order.countDocuments(),
      Coupon.countDocuments(),
    ]);

  const revenueResult = await Order.aggregate([
    { $match: { paymentStatus: "COMPLETED" } },
    { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
  ]);
  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  const recentOrders = await Order.find()
    .sort("-createdAt")
    .limit(5)
    .populate("userId", "name email");

  const ordersByStatus = await Order.aggregate([
    { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
  ]);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRevenue = await Order.aggregate([
    { $match: { paymentStatus: "COMPLETED", createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        revenue: { $sum: "$totalAmount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      totalUsers, totalProducts, totalOrders, totalRevenue,
      totalCoupons, recentOrders, ordersByStatus, monthlyRevenue,
    }, "Dashboard stats fetched")
  );
});

// ========================
// PRODUCT MANAGEMENT
// ========================

export const getAdminProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find().populate("category", "name slug").sort("-createdAt").skip(skip).limit(limit),
    Product.countDocuments(),
  ]);

  return res.status(200).json(
    new ApiResponse(200, { data: products, total, page, pages: Math.ceil(total / limit) }, "Products fetched")
  );
});

export const createProduct = asyncHandler(async (req, res) => {
  const {
    title, slug, description, shortDescription, category,
    price, discountPrice, stock, ingredients, shelfLife, variants,
    featured, bestseller,
  } = req.body;

  if (!title || !slug || !description || !shortDescription || !category || !price || stock === undefined) {
    throw new ApiError(400, "Required fields missing");
  }

  const existingProduct = await Product.findOne({ slug });
  if (existingProduct) {
    throw new ApiError(400, "Product with this slug already exists");
  }

  const imageLinks = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const uploadResult = await uploadOnCloudinary(file.path);
      if (uploadResult) {
        imageLinks.push({ public_id: uploadResult.public_id, url: uploadResult.secure_url });
      }
    }
  }

  const parsedIngredients = typeof ingredients === "string" ? JSON.parse(ingredients) : (ingredients || []);
  const parsedVariants = typeof variants === "string" ? JSON.parse(variants) : (variants || []);
  const isFeatured = featured === "true" || featured === true;
  const isBestseller = bestseller === "true" || bestseller === true;

  const product = await Product.create({
    title, slug, description, shortDescription, category,
    price, discountPrice, stock, ingredients: parsedIngredients,
    shelfLife, variants: parsedVariants, featured: isFeatured, bestseller: isBestseller,
    images: imageLinks.length > 0
      ? imageLinks
      : [{ url: "https://placehold.co/400x400/1E2B24/C9A66B?text=Product", public_id: "placeholder" }],
  });

  return res.status(201).json(new ApiResponse(201, product, "Product created"));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const productData = { ...req.body };

  // TASK 6: Destroy old Cloudinary images before uploading new ones
  if (req.files && req.files.length > 0) {
    const existingProduct = await Product.findById(req.params.id);
    if (existingProduct) {
      for (const img of existingProduct.images) {
        if (img.public_id && img.public_id !== "placeholder") {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
    }

    const imageLinks = [];
    for (const file of req.files) {
      const uploadResult = await uploadOnCloudinary(file.path);
      if (uploadResult) {
        imageLinks.push({ public_id: uploadResult.public_id, url: uploadResult.secure_url });
      }
    }
    if (imageLinks.length > 0) productData.images = imageLinks;
  }

  if (typeof productData.ingredients === "string") productData.ingredients = JSON.parse(productData.ingredients);
  if (typeof productData.variants === "string") productData.variants = JSON.parse(productData.variants);
  if (productData.featured !== undefined) productData.featured = productData.featured === "true" || productData.featured === true;
  if (productData.bestseller !== undefined) productData.bestseller = productData.bestseller === "true" || productData.bestseller === true;

  const product = await Product.findByIdAndUpdate(req.params.id, productData, {
    new: true, runValidators: true,
  });

  if (!product) throw new ApiError(404, "Product not found");

  return res.status(200).json(new ApiResponse(200, product, "Product updated"));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  // TASK 6: Destroy all Cloudinary images before deleting the product document
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  for (const img of product.images) {
    if (img.public_id && img.public_id !== "placeholder") {
      await cloudinary.uploader.destroy(img.public_id);
    }
  }

  await Product.findByIdAndDelete(req.params.id);

  return res.status(200).json(new ApiResponse(200, {}, "Product deleted"));
});

// ========================
// ORDER MANAGEMENT
// ========================

export const getAdminOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find().populate("userId", "name email phone").sort("-createdAt").skip(skip).limit(limit),
    Order.countDocuments(),
  ]);

  return res.status(200).json(
    new ApiResponse(200, { data: orders, total, page, pages: Math.ceil(total / limit) }, "Orders fetched")
  );
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus, trackingId } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (trackingId) order.trackingId = trackingId;
  await order.save();

  const updatedOrder = await Order.findById(order._id)
    .populate("userId", "name email phone")
    .populate("orderedItems.product", "title slug");

  // TASK 1: Send status-change emails
  if (orderStatus && updatedOrder.userId?.email) {
    const orderUser = updatedOrder.userId;
    if (orderStatus === "SHIPPED") {
      sendEmail({
        email: orderUser.email,
        subject: `Your Savora Order #${order._id.toString().slice(-8).toUpperCase()} Has Been Shipped!`,
        html: orderShippedTemplate(updatedOrder, orderUser),
      }).catch((err) => console.error("Shipped email failed:", err.message));
    } else if (orderStatus === "DELIVERED") {
      sendEmail({
        email: orderUser.email,
        subject: `Your Savora Order #${order._id.toString().slice(-8).toUpperCase()} Has Been Delivered!`,
        html: orderDeliveredTemplate(updatedOrder, orderUser),
      }).catch((err) => console.error("Delivered email failed:", err.message));
    }
  }

  return res.status(200).json(new ApiResponse(200, updatedOrder, "Order updated"));
});

// ========================
// USER MANAGEMENT
// ========================

export const getAdminUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().select("-password -refreshToken").sort("-createdAt").skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  return res.status(200).json(
    new ApiResponse(200, { data: users, total, page, pages: Math.ceil(total / limit) }, "Users fetched")
  );
});

export const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "ADMIN") throw new ApiError(400, "Cannot block an admin user");

  user.isBlocked = !user.isBlocked;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, { isBlocked: user.isBlocked }, `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`)
  );
});

// ========================
// COUPON MANAGEMENT
// ========================

export const getAdminCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort("-createdAt");
  return res.status(200).json(new ApiResponse(200, coupons, "Coupons fetched"));
});

export const createAdminCoupon = asyncHandler(async (req, res) => {
  const { code, discountPercentage, expiryDate, usageLimit, minimumOrderValue, activeStatus } = req.body;

  if (!code || !discountPercentage || !expiryDate) {
    throw new ApiError(400, "Code, discountPercentage, and expiryDate are required");
  }

  const existing = await Coupon.findOne({ code: code.toUpperCase() });
  if (existing) throw new ApiError(400, "Coupon code already exists");

  const coupon = await Coupon.create({ code, discountPercentage, expiryDate, usageLimit, minimumOrderValue, activeStatus });
  return res.status(201).json(new ApiResponse(201, coupon, "Coupon created"));
});

export const deleteAdminCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");
  return res.status(200).json(new ApiResponse(200, {}, "Coupon deleted"));
});

// TASK 6: Update (edit) coupon
export const updateAdminCoupon = asyncHandler(async (req, res) => {
  const { code, discountPercentage, expiryDate, usageLimit, minimumOrderValue, activeStatus } = req.body;

  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    { code: code?.toUpperCase(), discountPercentage, expiryDate, usageLimit, minimumOrderValue, activeStatus },
    { new: true, runValidators: true }
  );

  if (!coupon) throw new ApiError(404, "Coupon not found");
  return res.status(200).json(new ApiResponse(200, coupon, "Coupon updated"));
});

// ========================
// CATEGORY MANAGEMENT (TASK 2)
// ========================

export const getAdminCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort("name");
  return res.status(200).json(new ApiResponse(200, categories, "Categories fetched"));
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description } = req.body;

  if (!name || !slug || !description) {
    throw new ApiError(400, "name, slug, and description are required");
  }

  const existing = await Category.findOne({ slug: slug.toLowerCase() });
  if (existing) throw new ApiError(400, "Category with this slug already exists");

  let imageData = { url: "https://placehold.co/400x400/1E2B24/C9A66B?text=Category", public_id: "placeholder" };

  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (uploadResult) {
      imageData = { url: uploadResult.secure_url, public_id: uploadResult.public_id };
    }
  }

  const category = await Category.create({
    name,
    slug: slug.toLowerCase(),
    description,
    image: imageData.url,
    imagePublicId: imageData.public_id,
  });

  return res.status(201).json(new ApiResponse(201, category, "Category created"));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { name, slug, description } = req.body;
  const category = await Category.findById(req.params.id);

  if (!category) throw new ApiError(404, "Category not found");

  if (name) category.name = name;
  if (slug) category.slug = slug.toLowerCase();
  if (description) category.description = description;

  // If a new image is uploaded, destroy old and upload new
  if (req.file) {
    if (category.imagePublicId && category.imagePublicId !== "placeholder") {
      await cloudinary.uploader.destroy(category.imagePublicId);
    }
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (uploadResult) {
      category.image = uploadResult.secure_url;
      category.imagePublicId = uploadResult.public_id;
    }
  }

  await category.save();
  return res.status(200).json(new ApiResponse(200, category, "Category updated"));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  if (category.imagePublicId && category.imagePublicId !== "placeholder") {
    await cloudinary.uploader.destroy(category.imagePublicId);
  }

  await Category.findByIdAndDelete(req.params.id);
  return res.status(200).json(new ApiResponse(200, {}, "Category deleted"));
});
