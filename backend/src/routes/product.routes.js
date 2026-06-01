import express from "express";
import { getProducts, getProductBySlug } from "../controllers/product.controller.js";

const router = express.Router();

router.route("/").get(getProducts);
// FIX 4: Use /slug/:slug instead of /:id
router.route("/slug/:slug").get(getProductBySlug);

export default router;
