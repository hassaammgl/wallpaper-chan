import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    pin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pin",
      required: true,
    },
    user: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Like || mongoose.model("Like", likeSchema);
