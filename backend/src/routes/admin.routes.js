import express from "express";
import { verifyJWT, isAdmin } from "../middleware/authMiddleware.js";
import {
  getDashboardStats,
  getAdminProducts, createProduct, updateProduct, deleteProduct,
  getAdminOrders, updateOrderStatus,
  getAdminUsers, toggleBlockUser,
  getAdminCoupons, createAdminCoupon, updateAdminCoupon, deleteAdminCoupon,
  getAdminCategories, createCategory, updateCategory, deleteCategory,
} from "../controllers/admin.controller.js";
import {
  getBanners, createBanner, toggleBannerActive, deleteBanner,
} from "../controllers/banner.controller.js";
import {
  getSiteSettings,
  updateSiteSettings,
} from "../controllers/siteSettings.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

// All admin routes require auth + admin role
router.use(verifyJWT, isAdmin);

// Dashboard
router.get("/dashboard", getDashboardStats);

// Products
router.route("/products")
  .get(getAdminProducts)
  .post(upload.array("images", 5), createProduct);
router.route("/products/:id")
  .put(upload.array("images", 5), updateProduct)
  .delete(deleteProduct);

// Orders
router.get("/orders", getAdminOrders);
router.put("/orders/:id", updateOrderStatus);

// Users
router.get("/users", getAdminUsers);
router.put("/users/:id/block", toggleBlockUser);

// Coupons
router.route("/coupons").get(getAdminCoupons).post(createAdminCoupon);
router.route("/coupons/:id")
  .put(updateAdminCoupon)       // TASK 6: coupon edit
  .delete(deleteAdminCoupon);

// Categories
router.route("/categories")
  .get(getAdminCategories)
  .post(upload.single("image"), createCategory);
router.route("/categories/:id")
  .put(upload.single("image"), updateCategory)
  .delete(deleteCategory);

// Banners (TASK 3)
router.route("/banners")
  .get(getBanners)
  .post(upload.single("image"), createBanner);
router.put("/banners/:id/activate", toggleBannerActive);
router.delete("/banners/:id", deleteBanner);

// Site Settings
router.get("/site-settings", getSiteSettings);
router.put("/site-settings", updateSiteSettings);

export default router;
