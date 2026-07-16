export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import { getSession } from "@/lib/getSession";
import Pin from "@/lib/models/pin.model";
import Comment from "@/lib/models/comment.model";
import Board from "@/lib/models/board.model";
import Like from "@/lib/models/like.model";
import Follow from "@/lib/models/follow.model";
import Save from "@/lib/models/save.model";
import { countUsers, enrichWithUsers, listUsers } from "@/lib/users";

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
        listUsers({ limit: 5, offset: 0 }),
        Pin.countDocuments(),
        Comment.countDocuments(),
        Board.countDocuments(),
        Like.countDocuments(),
        Follow.countDocuments(),
        Save.countDocuments(),
      ]);

    const recentPins = await Pin.find().sort({ createdAt: -1 }).limit(5);
    const recentPinsWithUsers = await enrichWithUsers(recentPins);

    return Response.json({
      success: true,
      data: {
        totals: {
          users: usersRes.total || (await countUsers()),
          pins,
          comments,
          boards,
          likes,
          follows,
          saves,
        },
        recentUsers: usersRes.users,
        recentPins: recentPinsWithUsers,
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
