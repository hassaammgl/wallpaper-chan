export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import ViewHistory from "@/lib/models/viewHistory.model";
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
    const userId = searchParams.get("userId") || session.user.id;
    const limit = Math.min(Number(searchParams.get("limit")) || 30, 50);

    if (userId !== session.user.id) {
      return Response.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const history = await ViewHistory.find({ user: userId })
      .sort({ viewedAt: -1 })
      .limit(limit);

    const pinIds = history.map((h) => h.pin);
    const pins = await Pin.find({ _id: { $in: pinIds } });
    const pinMap = new Map(pins.map((p) => [p._id.toString(), p]));

    const ordered = history
      .map((h) => {
        const pin = pinMap.get(h.pin);
        if (!pin) return null;
        return { ...pin.toObject(), viewedAt: h.viewedAt };
      })
      .filter(Boolean);

    const withUsers = await enrichWithUsers(ordered);
    return Response.json(withUsers);
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch history" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ success: false }, { status: 401 });
    }

    await connectDB();
    const { pinId } = await request.json();
    if (!pinId) {
      return Response.json(
        { success: false, message: "pinId is required" },
        { status: 400 }
      );
    }

    await ViewHistory.findOneAndUpdate(
      { user: session.user.id, pin: pinId },
      { viewedAt: new Date() },
      { upsert: true, new: true }
    );

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to record view" },
      { status: 500 }
    );
  }
}
