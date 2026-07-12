import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    pin: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Comment ||
  mongoose.model("Comment", commentSchema);
