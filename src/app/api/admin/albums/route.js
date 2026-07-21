export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Board from "@/lib/models/board.model";
import Pin from "@/lib/models/pin.model";
import { requireAdmin } from "@/lib/requireAdmin";
import { enrichWithUsers } from "@/lib/users";

export async function GET(request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const search = searchParams.get("search");

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Board.countDocuments(query);
    const pages = Math.ceil(total / limit) || 1;

    const albums = await Board.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const withMeta = await Promise.all(
      albums.map(async (album) => {
        const boardId = album._id.toString();
        const pinQuery = {
          $or: [{ board: boardId }, { board: album.title }],
        };
        const [pinCount, firstPin] = await Promise.all([
          Pin.countDocuments(pinQuery),
          Pin.findOne(pinQuery)
            .sort({ createdAt: -1 })
            .select("media uploadProvider width height title"),
        ]);
        return {
          ...album.toObject(),
          pinCount,
          firstPin,
        };
      })
    );

    const withUsers = await enrichWithUsers(withMeta, {
      fields: ["id", "displayName", "userName", "img"],
    });

    return Response.json({
      success: true,
      data: { albums: withUsers, pages, total },
    });
  } catch (err) {
    console.error("Admin albums list failed:", err);
    return Response.json(
      { success: false, message: "Failed to fetch albums" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

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

    return Response.json(
      { success: true, data: album },
      { status: 201 }
    );
  } catch (err) {
    console.error("Admin album create failed:", err);
    return Response.json(
      { success: false, message: "Failed to create album" },
      { status: 500 }
    );
  }
}
