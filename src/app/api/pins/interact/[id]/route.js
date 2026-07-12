export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Like from "@/lib/models/like.model";
import Save from "@/lib/models/save.model";
import { getSession } from "@/lib/getSession";

export async function POST(request, { params }) {
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
    const { type } = await request.json();

    if (type === "like") {
      const existing = await Like.findOne({ pin: id, user: session.user.id });
      if (existing) {
        await Like.deleteOne({ _id: existing._id });
        return Response.json({ liked: false });
      } else {
        await Like.create({ pin: id, user: session.user.id });
        return Response.json({ liked: true });
      }
    }

    if (type === "save") {
      const existing = await Save.findOne({ pin: id, user: session.user.id });
      if (existing) {
        await Save.deleteOne({ _id: existing._id });
        return Response.json({ saved: false });
      } else {
        await Save.create({ pin: id, user: session.user.id });
        return Response.json({ saved: true });
      }
    }

    return Response.json(
      { success: false, message: "Invalid type" },
      { status: 400 }
    );
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to interact" },
      { status: 500 }
    );
  }
}
