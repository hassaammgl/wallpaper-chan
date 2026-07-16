export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Pin from "@/lib/models/pin.model";
import Board from "@/lib/models/board.model";
import { enrichWithUsers } from "@/lib/users";

export async function GET(_request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const pin = await Pin.findById(id);

    if (!pin) {
      return Response.json(
        { success: false, message: "Pin not found" },
        { status: 404 }
      );
    }

    const [withUser] = await enrichWithUsers([pin]);
    const result = { ...withUser };

    if (result.board) {
      const album = await Board.findById(result.board);
      if (album) {
        result.album = {
          _id: album._id,
          title: album.title,
        };
      }
    }

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch pin" },
      { status: 500 }
    );
  }
}
