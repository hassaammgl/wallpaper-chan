import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    follower: { type: String, required: true },
    following: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Follow || mongoose.model("Follow", followSchema);
