import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    uploadProvider: {
      type: String,
      enum: ["imagekit", "cloudinary"],
      default: "imagekit",
    },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings ||
  mongoose.model("SiteSettings", siteSettingsSchema);
