import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// routes import
import authRouter from "./routes/auth.routes.js";
import productRouter from "./routes/product.routes.js";
import adminRouter from "./routes/admin.routes.js";
import orderRouter from "./routes/order.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import reviewRouter from "./routes/review.routes.js";
import publicRouter from "./routes/public.routes.js";
import { getActiveBanner } from "./controllers/banner.controller.js";
import { getSiteSettings } from "./controllers/siteSettings.controller.js";
import { Product } from "./models/product.model.js";
import { Category } from "./models/category.model.js";

// routes declaration
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/admin", adminRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payments", paymentRouter);
app.use("/api", reviewRouter);
app.use("/api", publicRouter);          // TASK 6: public coupon validate route

// Public banner route
app.get("/api/banners/active", getActiveBanner);
app.get("/api/site-settings", getSiteSettings);

// Health check
app.get("/api/v1/healthcheck", (req, res) => {
  res.status(200).json({ status: "success", message: "Server is running" });
});

// TASK 5 — Sitemap XML
app.get("/sitemap.xml", async (req, res) => {
  try {
    const [products, categories] = await Promise.all([
      Product.find({ isActive: true }).select("slug updatedAt").lean(),
      Category.find().select("slug updatedAt").lean(),
    ]);

    const staticUrls = [
      { loc: "/", changefreq: "weekly", priority: "1.0" },
      { loc: "/shop", changefreq: "daily", priority: "0.9" },
      { loc: "/about", changefreq: "monthly", priority: "0.5" },
      { loc: "/contact", changefreq: "monthly", priority: "0.5" },
    ];

    const siteUrl = process.env.CLIENT_URL || "https://savora.in";

    const toUrl = ({ loc, changefreq, priority, lastmod }) =>
      `  <url>\n    <loc>${siteUrl}${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}${changefreq ? `\n    <changefreq>${changefreq}</changefreq>` : ""}${priority ? `\n    <priority>${priority}</priority>` : ""}\n  </url>`;

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...staticUrls.map(toUrl),
      ...categories.map((cat) =>
        toUrl({ loc: `/shop?category=${cat.slug}`, changefreq: "weekly", priority: "0.7", lastmod: cat.updatedAt?.toISOString() })
      ),
      ...products.map((p) =>
        toUrl({ loc: `/product/${p.slug}`, changefreq: "weekly", priority: "0.8", lastmod: p.updatedAt?.toISOString() })
      ),
      "</urlset>",
    ].join("\n");

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    console.error("Sitemap error:", err.message);
    res.status(500).send("Failed to generate sitemap");
  }
});

// global error handler (must be last)
app.use(errorHandler);

export { app };
