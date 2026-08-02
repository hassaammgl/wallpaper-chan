export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Comment from "@/lib/models/comment.model";
import { enrichWithUsers } from "@/lib/users";
import { requireAdmin } from "@/lib/requireAdmin";
import { handleApiError, AppError } from "@/lib/AppError";
import { ADMIN_COMMENTS_PAGE_SIZE } from "@/lib/constants";

export async function GET(request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || ADMIN_COMMENTS_PAGE_SIZE);

    const total = await Comment.countDocuments();
    const comments = await Comment.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return Response.json({
      success: true,
      data: {
        comments: await enrichWithUsers(comments),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    return handleApiError(new AppError("Failed to fetch comments", 500));
  }
}
