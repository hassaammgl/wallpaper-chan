export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Save from "@/lib/models/save.model";
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

    if (userId !== session.user.id) {
      return Response.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const saves = await Save.find({ user: userId }).sort({ createdAt: -1 });
    const pinIds = saves.map((s) => s.pin);
    const pins = await Pin.find({ _id: { $in: pinIds } });
    const pinMap = new Map(pins.map((p) => [p._id.toString(), p]));

    const ordered = saves
      .map((s) => pinMap.get(s.pin.toString()))
      .filter(Boolean);

    const withUsers = await enrichWithUsers(ordered);
    return Response.json(withUsers);
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch saved pins" },
      { status: 500 }
    );
  }
}
