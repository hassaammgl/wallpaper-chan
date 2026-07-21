import mongoose from "mongoose";

const draftSchema = new mongoose.Schema(
  {
    user: { type: String, required: true, index: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    prompt: { type: String, default: "" },
    link: { type: String, default: "" },
    board: { type: String, default: "general" },
    tags: { type: [String], default: [] },
    deviceType: {
      type: String,
      enum: ["mobile", "desktop", "both"],
      default: "both",
    },
    category: { type: String, default: "general" },
    media: { type: String, default: null },
    originalMedia: { type: String, default: null },
    originalUrl: { type: String, default: null },
    uploadProvider: {
      type: String,
      enum: ["imagekit", "cloudinary"],
    },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    resolution: { type: String, default: null },
    fileName: { type: String, default: null },
  },
  { timestamps: true }
);

draftSchema.index({ user: 1, updatedAt: -1 });

export default mongoose.models.Draft || mongoose.model("Draft", draftSchema);
