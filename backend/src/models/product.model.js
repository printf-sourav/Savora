import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
    ingredients: [
      {
        type: String,
      },
    ],
    shelfLife: {
      type: String,
    },
    ratings: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    variants: [
      {
        name: String,
        price: Number,
        stock: Number,
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
    bestseller: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    seoTitle: {
      type: String,
    },
    seoDescription: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// TASK 4: Full-text search index on title and shortDescription
productSchema.index({ title: "text", shortDescription: "text" });

export const Product = mongoose.model("Product", productSchema);
