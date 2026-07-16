import mongoose from "mongoose";

const pinSchema = new mongoose.Schema(
  {
    media: { type: String, required: true },
    originalMedia: { type: String },
    originalUrl: { type: String },
    uploadProvider: {
      type: String,
      enum: ["imagekit", "cloudinary"],
      default: "imagekit",
    },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    resolution: { type: String },
    deviceType: {
      type: String,
      enum: ["mobile", "desktop", "both"],
      default: "both",
    },
    category: { type: String, default: "general" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    prompt: { type: String },
    link: { type: String },
    board: { type: String, required: true },
    tags: { type: [String] },
    user: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Pin || mongoose.model("Pin", pinSchema);
