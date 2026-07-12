import { Router } from "express";
import { protect } from "../middlewares/auth.middlewares.js";
import {
    getUploadAuth,
    getCloudinarySignature,
    getUploadConfig,
} from "../controllers/upload.controller.js";

const router = Router();

router.get("/config", getUploadConfig);
router.get("/auth", protect, getUploadAuth);
router.get("/cloudinary/sign", protect, getCloudinarySignature);

export default router;
