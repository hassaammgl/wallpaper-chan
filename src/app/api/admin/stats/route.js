export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import { getSession } from "@/lib/getSession";
import { getAuth } from "@/lib/auth";
import Pin from "@/lib/models/pin.model";
import Comment from "@/lib/models/comment.model";
import Board from "@/lib/models/board.model";
import Like from "@/lib/models/like.model";
import Follow from "@/lib/models/follow.model";
import Save from "@/lib/models/save.model";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const [usersRes, pins, comments, boards, likes, follows, saves] =
      await Promise.all([
        getAuth().api.listUsers({ query: { limit: 5 } }),
        Pin.countDocuments(),
        Comment.countDocuments(),
        Board.countDocuments(),
        Like.countDocuments(),
        Follow.countDocuments(),
        Save.countDocuments(),
      ]);

    const recentUsers = (usersRes.users || []).map((u) => ({
      _id: u.id,
      displayName: u.displayName || u.name,
      userName: u.userName,
      email: u.email,
      img: u.img,
      role: u.role,
      createdAt: u.createdAt,
    }));

    const recentPins = await Pin.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "displayName userName img");

    return Response.json({
      success: true,
      data: {
        totals: {
          users: usersRes.total || recentUsers.length,
          pins,
          comments,
          boards,
          likes,
          follows,
          saves,
        },
        recentUsers,
        recentPins,
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
