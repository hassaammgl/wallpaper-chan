export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import { getSession } from "@/lib/getSession";
import Pin from "@/lib/models/pin.model";
import Comment from "@/lib/models/comment.model";
import Like from "@/lib/models/like.model";
import Save from "@/lib/models/save.model";

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

    await Pin.deleteOne({ _id: id });
    await Comment.deleteMany({ pin: id });
    await Like.deleteMany({ pin: id });
    await Save.deleteMany({ pin: id });

    return Response.json({ success: true, message: "Pin deleted" });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to delete pin" },
      { status: 500 }
    );
  }
}
