export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Comment from "@/lib/models/comment.model";
import { getSession } from "@/lib/getSession";
import { enrichWithUsers } from "@/lib/users";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const pinId = searchParams.get("pinId");

    if (!pinId) {
      return Response.json(
        { success: false, message: "pinId is required" },
        { status: 400 }
      );
    }

    const comments = await Comment.find({ pin: pinId }).sort({ createdAt: -1 });
    const withUsers = await enrichWithUsers(comments);

    return Response.json(withUsers);
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const { description, pin } = await request.json();

    const comment = await Comment.create({
      description,
      pin,
      user: session.user.id,
    });

    const [withUser] = await enrichWithUsers([comment]);
    return Response.json(withUser, { status: 201 });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to add comment" },
      { status: 500 }
    );
  }
}
