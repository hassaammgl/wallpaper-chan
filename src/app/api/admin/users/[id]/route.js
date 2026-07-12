export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import { getSession } from "@/lib/getSession";
import { getAuth } from "@/lib/auth";
import Pin from "@/lib/models/pin.model";
import Comment from "@/lib/models/comment.model";
import Board from "@/lib/models/board.model";
import Like from "@/lib/models/like.model";
import Save from "@/lib/models/save.model";
import Follow from "@/lib/models/follow.model";

export async function PATCH(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const fields = {};
    if (body.role !== undefined) fields.role = body.role;
    if (body.blocked !== undefined) fields.blocked = body.blocked;

    await (await getAuth()).api.updateUser({
      userId: id,
      fields,
    });

    return Response.json({ success: true, message: "User updated" });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to update user" },
      { status: 500 }
    );
  }
}

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

    await (await getAuth()).api.removeUser({ userId: id });
    await Pin.deleteMany({ user: id });
    await Comment.deleteMany({ user: id });
    await Board.deleteMany({ user: id });
    await Like.deleteMany({ user: id });
    await Save.deleteMany({ user: id });
    await Follow.deleteMany({ $or: [{ follower: id }, { following: id }] });

    return Response.json({ success: true, message: "User deleted" });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to delete user" },
      { status: 500 }
    );
  }
}
