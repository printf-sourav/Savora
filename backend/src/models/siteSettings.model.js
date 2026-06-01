import mongoose, { Schema } from "mongoose";

const siteSettingsSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "global",
    },
    announcementBarEnabled: {
      type: Boolean,
      default: true,
    },
    announcementBarText: {
      type: String,
      default: "Free Shipping on orders above ₹999 | Use code SAVORA10 for 10% off",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);