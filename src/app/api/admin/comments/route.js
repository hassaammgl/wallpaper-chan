export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import { getSession } from "@/lib/getSession";
import Comment from "@/lib/models/comment.model";

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const total = await Comment.countDocuments();
    const pages = Math.ceil(total / limit);

    const comments = await Comment.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "displayName userName img");

    return Response.json({
      success: true,
      data: { comments, pages, total },
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
