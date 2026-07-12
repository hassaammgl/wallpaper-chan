export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Board from "@/lib/models/board.model";
import Pin from "@/lib/models/pin.model";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { userId } = await params;

    const boards = await Board.find({ user: userId }).sort({ createdAt: -1 });

    const boardsWithPins = await Promise.all(
      boards.map(async (board) => {
        const pinCount = await Pin.countDocuments({ board: board.title, user: userId });
        const firstPin = await Pin.findOne({ board: board.title, user: userId })
          .sort({ createdAt: -1 })
          .select("media uploadProvider");

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
      { success: false, message: "Failed to fetch boards" },
      { status: 500 }
    );
  }
}
