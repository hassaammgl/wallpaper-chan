export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Comment from "@/lib/models/comment.model";
import { getSession } from "@/lib/getSession";

export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return Response.json(
        { success: false, message: "Comment not found" },
        { status: 404 }
      );
    }

    if (comment.user.toString() !== session.user.id) {
      return Response.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    await Comment.deleteOne({ _id: id });
    return Response.json({ success: true, message: "Comment deleted" });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
