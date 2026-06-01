import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    image: {
      type: String,
      default: "https://placehold.co/400x400/1E2B24/C9A66B?text=Category",
    },
    // TASK 2: Store Cloudinary public_id for destroy on update/delete
    imagePublicId: {
      type: String,
      default: "placeholder",
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Category = mongoose.model("Category", categorySchema);
