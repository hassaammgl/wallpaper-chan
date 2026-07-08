import express from "express"
import { getPostComments, addComment, deleteComment } from "../controllers/Comment.controller.js";
import { protect } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.get("/:postId", getPostComments)
router.post("/", protect, addComment)
router.delete("/:id", protect, deleteComment);

export default router;
