import imagekit from "./imagekit.js";
import cloudinary from "./cloudinary.js";
import { ENVS } from "../config/constants.js";

export function getDownloadUrl(pin) {
    const provider = pin.uploadProvider || "imagekit";
    const key = pin.originalMedia || pin.media;
    const originalUrl = pin.originalUrl;

    if (provider === "cloudinary") {
        if (originalUrl) return originalUrl;
        if (!ENVS.CLOUDINARY_CLOUD_NAME || !key) return null;
        return cloudinary.url(key, {
            secure: true,
            flags: "attachment",
            quality: 100,
            fetch_format: "auto",
        });
    }

    if (originalUrl) return originalUrl;
    if (!key) return null;
    return imagekit.url({ path: key, transformation: [] });
}

export function getDisplayUrl(pin, { width = 1200 } = {}) {
    const provider = pin.uploadProvider || "imagekit";
    const key = pin.media;

    if (provider === "cloudinary") {
        if (!ENVS.CLOUDINARY_CLOUD_NAME || !key) return pin.originalUrl || null;
        return cloudinary.url(key, {
            secure: true,
            width,
            crop: "limit",
            quality: "auto:good",
            fetch_format: "auto",
        });
    }

    if (!key) return null;
    return imagekit.url({
        path: key,
        transformation: [{ width, quality: 80 }],
    });
}
