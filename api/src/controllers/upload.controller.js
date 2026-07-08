import asyncHandler from "express-async-handler";
import imagekit from "../utils/imagekit.js";
import cloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { SettingsService } from "../services/settings.service.js";
import { ENVS } from "../config/constants.js";
import { AppError } from "../utils/AppError.js";

export const getUploadConfig = asyncHandler(async (req, res) => {
    const settings = await SettingsService.get();
    return ApiResponse.success(res, {
        message: "Upload config fetched",
        data: {
            provider: settings.uploadProvider,
            imagekit: {
                publicKey: ENVS.IK_PUBLIC_KEY,
                urlEndpoint: ENVS.IK_URL_ENDPOINT,
            },
            cloudinary: {
                cloudName: ENVS.CLOUDINARY_CLOUD_NAME,
                apiKey: ENVS.CLOUDINARY_API_KEY,
            },
        },
    });
});

export const getUploadAuth = asyncHandler(async (req, res) => {
    const auth = imagekit.getAuthenticationParameters();
    return ApiResponse.success(res, {
        message: "Upload authentication generated",
        data: auth,
    });
});

export const getCloudinarySignature = asyncHandler(async (req, res) => {
    if (!ENVS.CLOUDINARY_CLOUD_NAME || !ENVS.CLOUDINARY_API_SECRET) {
        throw new AppError("Cloudinary is not configured on the server", 503);
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = "wallpapers";
    const paramsToSign = { timestamp, folder };

    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        ENVS.CLOUDINARY_API_SECRET
    );

    return ApiResponse.success(res, {
        message: "Cloudinary signature generated",
        data: {
            timestamp,
            signature,
            folder,
            cloudName: ENVS.CLOUDINARY_CLOUD_NAME,
            apiKey: ENVS.CLOUDINARY_API_KEY,
        },
    });
});
