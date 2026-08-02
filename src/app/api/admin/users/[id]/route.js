export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Pin from "@/lib/models/pin.model";
import Comment from "@/lib/models/comment.model";
import Board from "@/lib/models/board.model";
import Like from "@/lib/models/like.model";
import Save from "@/lib/models/save.model";
import Follow from "@/lib/models/follow.model";
import { deleteUserById, updateUserById } from "@/lib/users";
import { requireAdmin } from "@/lib/requireAdmin";
import { handleApiError, AppError } from "@/lib/AppError";

export async function PATCH(request, { params }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const fields = {};
    if (body.role !== undefined) fields.role = body.role;
    if (body.blocked !== undefined) fields.blocked = body.blocked;

    const user = await updateUserById(id, fields);
    return Response.json({ success: true, message: "User updated", user });
  } catch (error) {
    return handleApiError(
      error instanceof AppError
        ? error
        : new AppError(error.message || "Failed to update user", error.status || 500)
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    await connectDB();

    await deleteUserById(id);
    await Pin.deleteMany({ user: id });
    await Comment.deleteMany({ user: id });
    await Board.deleteMany({ user: id });
    await Like.deleteMany({ user: id });
    await Save.deleteMany({ user: id });
    await Follow.deleteMany({ $or: [{ follower: id }, { following: id }] });

    return Response.json({ success: true, message: "User deleted" });
  } catch (error) {
    return handleApiError(new AppError("Failed to delete user", 500));
  }
}
