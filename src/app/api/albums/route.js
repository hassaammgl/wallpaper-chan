export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Board from "@/lib/models/board.model";
import Pin from "@/lib/models/pin.model";
import { getSession } from "@/lib/getSession";

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const { title, description, isPublic } = await request.json();

    if (!title?.trim()) {
      return Response.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

    const album = await Board.create({
      title: title.trim(),
      description: description?.trim() || "",
      user: session.user.id,
      isPublic: isPublic !== false,
    });

    return Response.json(album, { status: 201 });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to create album" },
      { status: 500 }
    );
  }
}
