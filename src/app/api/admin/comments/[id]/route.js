export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Comment from "@/lib/models/comment.model";
import { requireAdmin } from "@/lib/requireAdmin";
import { handleApiError, AppError } from "@/lib/AppError";

export async function DELETE(_request, { params }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    await connectDB();
    await Comment.deleteOne({ _id: id });
    return Response.json({ success: true, message: "Comment deleted" });
  } catch (error) {
    return handleApiError(new AppError("Failed to delete comment", 500));
  }
}
