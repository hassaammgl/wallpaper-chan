export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Pin from "@/lib/models/pin.model";
import Board from "@/lib/models/board.model";
import { getSession } from "@/lib/getSession";
import { enrichWithUsers, getBlockedUserIds } from "@/lib/users";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") || 0;
    const search = searchParams.get("search");
    const userId = searchParams.get("userId");
    const boardId = searchParams.get("boardId");
    const deviceType = searchParams.get("deviceType");
    const limit = 20;

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
        { category: { $regex: search, $options: "i" } },
      ];
    }
    if (boardId) {
      const board = await Board.findById(boardId);
      if (board) {
        query.$or = [{ board: boardId }, { board: board.title }];
      } else {
        query.board = boardId;
      }
    }
    if (deviceType) query.deviceType = deviceType;

    try {
      const blockedIds = await getBlockedUserIds();
      if (userId) {
        if (blockedIds.includes(userId)) {
          return Response.json({ pins: [], nextCursor: null });
        }
        query.user = userId;
      } else if (blockedIds.length > 0) {
        query.user = { $nin: blockedIds };
      }
    } catch {
      if (userId) query.user = userId;
    }

    const pins = await Pin.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(cursor))
      .limit(limit + 1);

    const hasMore = pins.length > limit;
    const result = hasMore ? pins.slice(0, limit) : pins;
    const pinsWithUsers = await enrichWithUsers(result);

    return Response.json({
      pins: pinsWithUsers,
      nextCursor: hasMore ? Number(cursor) + limit : null,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch pins" },
      { status: 500 }
    );
  }
}

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
    const body = await request.json();
    const {
      title,
      description,
      prompt,
      link,
      board,
      tags,
      media,
      originalMedia,
      originalUrl,
      uploadProvider,
      width,
      height,
      resolution,
      deviceType,
      category,
    } = body;

    const tagsArray = tags
      ? typeof tags === "string"
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : tags
      : [];

    const pin = await Pin.create({
      title,
      description,
      prompt: prompt || null,
      link,
      board: board || null,
      tags: tagsArray,
      media,
      originalMedia,
      originalUrl,
      uploadProvider: uploadProvider || "imagekit",
      width: Number(width),
      height: Number(height),
      resolution,
      deviceType: deviceType || "both",
      category: category || "general",
      user: session.user.id,
    });

    return Response.json(pin, { status: 201 });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to create pin" },
      { status: 500 }
    );
  }
}
