import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    pin: { type: String, default: null },
    album: { type: String, default: null },
    user: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Comment ||
  mongoose.model("Comment", commentSchema);
