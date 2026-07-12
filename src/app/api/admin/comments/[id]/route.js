export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import { getSession } from "@/lib/getSession";
import Comment from "@/lib/models/comment.model";

export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();

    await Comment.deleteOne({ _id: id });
    return Response.json({ success: true, message: "Comment deleted" });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
