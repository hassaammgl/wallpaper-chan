export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Follow from "@/lib/models/follow.model";
import { getSession } from "@/lib/getSession";
import { findUserByUserName } from "@/lib/users";

export async function POST(_request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const { userName } = await params;

    const target = await findUserByUserName(userName);
    if (!target) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (target.id === session.user.id) {
      return Response.json(
        { success: false, message: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    const existing = await Follow.findOne({
      follower: session.user.id,
      following: target.id,
    });

    if (existing) {
      await Follow.deleteOne({ _id: existing._id });
      return Response.json({ following: false });
    }

    await Follow.create({
      follower: session.user.id,
      following: target.id,
    });
    return Response.json({ following: true });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to follow" },
      { status: 500 }
    );
  }
}
