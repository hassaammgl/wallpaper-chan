export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Board from "@/lib/models/board.model";
import Pin from "@/lib/models/pin.model";
import Comment from "@/lib/models/comment.model";
import { getSession } from "@/lib/getSession";
import { enrichWithUsers, findUserById } from "@/lib/users";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const session = await getSession();

    const album = await Board.findById(id);
    if (!album) {
      return Response.json(
        { success: false, message: "Album not found" },
        { status: 404 }
      );
    }

    const isOwner = session?.user?.id === album.user;
    if (!album.isPublic && !isOwner) {
      return Response.json(
        { success: false, message: "Album is private" },
        { status: 403 }
      );
    }

    const boardId = album._id.toString();
    const pins = await Pin.find({
      $or: [{ board: boardId }, { board: album.title }],
      user: album.user,
    }).sort({ createdAt: -1 });

    const pinsWithUsers = await enrichWithUsers(pins);
    const owner = await findUserById(album.user);
    const commentCount = await Comment.countDocuments({ album: boardId });

    return Response.json({
      ...album.toObject(),
      owner,
      pins: pinsWithUsers,
      pinCount: pinsWithUsers.length,
      commentCount,
      isOwner,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch album" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
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
    const album = await Board.findById(id);

    if (!album) {
      return Response.json(
        { success: false, message: "Album not found" },
        { status: 404 }
      );
    }

    if (album.user !== session.user.id) {
      return Response.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const { title, description, isPublic } = await request.json();
    if (title !== undefined) album.title = title.trim();
    if (description !== undefined) album.description = description.trim();
    if (isPublic !== undefined) album.isPublic = isPublic;

    await album.save();
    return Response.json(album);
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to update album" },
      { status: 500 }
    );
  }
}

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
    const album = await Board.findById(id);

    if (!album) {
      return Response.json(
        { success: false, message: "Album not found" },
        { status: 404 }
      );
    }

    if (album.user !== session.user.id) {
      return Response.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const boardId = album._id.toString();
    await Pin.updateMany({ board: boardId }, { $unset: { board: "" } });
    await Comment.deleteMany({ album: boardId });
    await Board.deleteOne({ _id: album._id });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to delete album" },
      { status: 500 }
    );
  }
}
