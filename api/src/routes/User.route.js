import express from "express";
import { protect, optionalAuth } from "../middlewares/auth.middlewares.js";
import { getUser, followUser } from "../controllers/User.controller.js";

const router = express.Router();
router.get("/:userName", optionalAuth, getUser);
router.post("/follow/:userName", protect, followUser)

export default router;
