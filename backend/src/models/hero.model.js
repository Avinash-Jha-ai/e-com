import mongoose from "mongoose";

const heroSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    badge: {
      type: String,
      default: "Handloom Edit 2026",
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      default: null,
    },
    sellerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    ctaText: {
      type: String,
      default: "Discover Drape",
      trim: true,
    },
    ctaLink: {
      type: String,
      default: "/shop",
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const heroModel = mongoose.models.Hero || mongoose.model("Hero", heroSchema);

export default heroModel;
