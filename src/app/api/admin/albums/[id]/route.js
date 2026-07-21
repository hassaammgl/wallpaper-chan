export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Board from "@/lib/models/board.model";
import Pin from "@/lib/models/pin.model";
import Comment from "@/lib/models/comment.model";
import { requireAdmin } from "@/lib/requireAdmin";

export async function PATCH(request, { params }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    await connectDB();

    const album = await Board.findById(id);
    if (!album) {
      return Response.json(
        { success: false, message: "Album not found" },
        { status: 404 }
      );
    }

    const { title, description, isPublic } = await request.json();
    if (title !== undefined) {
      const trimmed = String(title).trim();
      if (!trimmed) {
        return Response.json(
          { success: false, message: "Title is required" },
          { status: 400 }
        );
      }
      album.title = trimmed;
    }
    if (description !== undefined) {
      album.description = String(description || "").trim();
    }
    if (isPublic !== undefined) album.isPublic = !!isPublic;

    await album.save();
    return Response.json({ success: true, data: album });
  } catch (err) {
    return Response.json(
      { success: false, message: "Failed to update album" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    await connectDB();

    const album = await Board.findById(id);
    if (!album) {
      return Response.json(
        { success: false, message: "Album not found" },
        { status: 404 }
      );
    }

    const boardId = album._id.toString();
    await Pin.updateMany(
      { $or: [{ board: boardId }, { board: album.title }] },
      { $set: { board: "general" } }
    );
    await Comment.deleteMany({ album: boardId });
    await Board.deleteOne({ _id: album._id });

    return Response.json({ success: true, message: "Album deleted" });
  } catch (err) {
    return Response.json(
      { success: false, message: "Failed to delete album" },
      { status: 500 }
    );
  }
}
