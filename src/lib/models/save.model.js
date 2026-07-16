import mongoose from "mongoose";

const saveSchema = new mongoose.Schema(
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

export default mongoose.models.Save || mongoose.model("Save", saveSchema);
