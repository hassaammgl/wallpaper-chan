import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 2,
        message: "Conversation must have exactly 2 participants",
      },
    },
    participantKey: { type: String, required: true, unique: true },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
    lastSender: { type: String, default: null },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

export default mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);
