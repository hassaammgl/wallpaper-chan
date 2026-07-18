import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: String, required: true, index: true },
    sender: { type: String, required: true },
    text: { type: String, required: true, maxlength: 2000 },
    readBy: { type: [String], default: [] },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: -1 });

export default mongoose.models.Message ||
  mongoose.model("Message", messageSchema);
