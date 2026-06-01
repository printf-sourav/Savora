import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate average rating for product after save
reviewSchema.post("save", async function () {
  const reviews = await this.model("Review").find({ product: this.product });
  const averageRating =
    reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

  await mongoose.model("Product").findByIdAndUpdate(this.product, {
    ratings: averageRating,
  });
});

export const Review = mongoose.model("Review", reviewSchema);
