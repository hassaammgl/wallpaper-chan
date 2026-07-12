import { Schema } from "mongoose";
import mongoose from "mongoose";

const pinSchema = new Schema({
    media: {
        type: String,
        required: true,
    },
    originalMedia: {
        type: String,
    },
    originalUrl: {
        type: String,
    },
    uploadProvider: {
        type: String,
        enum: ["imagekit", "cloudinary"],
        default: "imagekit",
    },
    width: {
        type: Number,
        required: true,
    },
    height: {
        type: Number,
        required: true,
    },
    resolution: {
        type: String,
    },
    deviceType: {
        type: String,
        enum: ["mobile", "desktop", "both"],
        default: "both",
    },
    category: {
        type: String,
        default: "general",
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    link: {
        type: String,
    },
    board: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });

export default mongoose.model("Pin", pinSchema);
