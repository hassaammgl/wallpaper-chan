import { v2 as cloudinary } from "cloudinary";
import { ENVS } from "../config/constants.js";

if (ENVS.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
        cloud_name: ENVS.CLOUDINARY_CLOUD_NAME,
        api_key: ENVS.CLOUDINARY_API_KEY,
        api_secret: ENVS.CLOUDINARY_API_SECRET,
        secure: true,
    });
}

export default cloudinary;
