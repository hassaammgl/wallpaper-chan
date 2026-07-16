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
    const albumId = searchParams.get("albumId");

    if (!pinId && !albumId) {
      return Response.json(
        { success: false, message: "pinId or albumId is required" },
        { status: 400 }
      );
    }

    const query = pinId ? { pin: pinId } : { album: albumId };
    const comments = await Comment.find(query).sort({ createdAt: -1 });
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
    const { description, pin, album } = await request.json();

    if (!description?.trim()) {
      return Response.json(
        { success: false, message: "Description is required" },
        { status: 400 }
      );
    }

    if (!pin && !album) {
      return Response.json(
        { success: false, message: "pin or album is required" },
        { status: 400 }
      );
    }

    const comment = await Comment.create({
      description: description.trim(),
      pin: pin || null,
      album: album || null,
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
