import mongoose from "mongoose";

const viewHistorySchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    pin: { type: String, required: true },
    viewedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

viewHistorySchema.index({ user: 1, pin: 1 }, { unique: true });
viewHistorySchema.index({ user: 1, viewedAt: -1 });

export default mongoose.models.ViewHistory ||
  mongoose.model("ViewHistory", viewHistorySchema);
