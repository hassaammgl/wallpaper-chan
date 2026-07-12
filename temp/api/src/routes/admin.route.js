import { Router } from "express";
import { protect, isAdmin } from "../middlewares/auth.middlewares.js";
import {
    getStats,
    getUsers,
    updateUser,
    deleteUser,
    getPins,
    deletePin,
    getComments,
    deleteComment,
    getSettings,
    updateSettings,
} from "../controllers/admin.controller.js";

const router = Router();

router.use(protect, isAdmin);

router.get("/stats", getStats);
router.get("/users", getUsers);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/pins", getPins);
router.delete("/pins/:id", deletePin);
router.get("/comments", getComments);
router.delete("/comments/:id", deleteComment);
router.get("/settings", getSettings);
router.patch("/settings", updateSettings);

export default router;
