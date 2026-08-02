export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Board from "@/lib/models/board.model";
import Pin from "@/lib/models/pin.model";
import { getSession } from "@/lib/getSession";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { userId } = await params;
    const session = await getSession();
    const isOwner = session?.user?.id === userId;
    const isAdmin = session?.user?.role === "admin";

    const filter = { user: userId };
    if (!isOwner && !isAdmin) {
      filter.isPublic = { $ne: false };
    }

    const boards = await Board.find(filter).sort({ createdAt: -1 });

    const boardsWithPins = await Promise.all(
      boards.map(async (board) => {
        const boardId = board._id.toString();
        const pinQuery = {
          user: userId,
          $or: [{ board: boardId }, { board: board.title }],
        };
        const pinCount = await Pin.countDocuments(pinQuery);
        const firstPin = await Pin.findOne(pinQuery)
          .sort({ createdAt: -1 })
          .select("media uploadProvider width height originalUrl");

        return {
          ...board.toObject(),
          pinCount,
          firstPin,
        };
      })
    );

    return Response.json(boardsWithPins);
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch albums" },
      { status: 500 }
    );
  }
}
