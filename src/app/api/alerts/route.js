export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Comment from "@/lib/models/comment.model";
import Pin from "@/lib/models/pin.model";
import { getSession } from "@/lib/getSession";
import { enrichWithUsers } from "@/lib/users";

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const cursor = Number(searchParams.get("cursor") || 0);
    const limit = Math.min(Number(searchParams.get("limit") || 30), 50);
    const userId = session.user.id;

    const myPins = await Pin.find({ user: userId }).select(
      "_id title media uploadProvider width height"
    );
    const pinIds = myPins.map((p) => p._id.toString());
    const pinMap = new Map(myPins.map((p) => [p._id.toString(), p.toObject()]));

    if (pinIds.length === 0) {
      return Response.json({ comments: [], nextCursor: null });
    }

    const comments = await Comment.find({
      pin: { $in: pinIds },
      user: { $ne: userId },
    })
      .sort({ createdAt: -1 })
      .skip(cursor)
      .limit(limit + 1);

    const hasMore = comments.length > limit;
    const page = hasMore ? comments.slice(0, limit) : comments;
    const withUsers = await enrichWithUsers(page, {
      fields: ["id", "displayName", "userName", "img"],
    });

    const enriched = withUsers.map((comment) => ({
      ...comment,
      pin: pinMap.get(String(comment.pin)) || null,
    }));

    return Response.json({
      comments: enriched,
      nextCursor: hasMore ? cursor + limit : null,
    });
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
    return Response.json(
      { success: false, message: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
