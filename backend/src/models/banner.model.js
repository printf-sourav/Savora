import mongoose, { Schema } from "mongoose";

const bannerSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
    },
    ctaText: {
      type: String,
      default: "Shop Now",
    },
    ctaLink: {
      type: String,
      default: "/shop",
    },
    image: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: "placeholder",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Banner = mongoose.model("Banner", bannerSchema);
