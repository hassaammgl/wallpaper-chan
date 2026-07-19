export const dynamic = "force-dynamic";

import mongoose from "mongoose";
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
      if (mongoose.isValidObjectId(boardId)) {
        const board = await Board.findById(boardId);
        if (board) {
          query.$or = [{ board: boardId }, { board: board.title }];
        } else {
          query.board = boardId;
        }
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

    if (session.user.role !== "admin") {
      return Response.json(
        { success: false, message: "Only admins can upload wallpapers" },
        { status: 403 }
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

    if (!title?.trim() || !description?.trim()) {
      return Response.json(
        { success: false, message: "Title and description are required" },
        { status: 400 }
      );
    }

    if (!media && !originalMedia) {
      return Response.json(
        { success: false, message: "Image upload is required" },
        { status: 400 }
      );
    }

    const pinWidth = Number(width);
    const pinHeight = Number(height);
    if (!Number.isFinite(pinWidth) || !Number.isFinite(pinHeight)) {
      return Response.json(
        { success: false, message: "Image dimensions are required" },
        { status: 400 }
      );
    }

    const tagsArray = tags
      ? typeof tags === "string"
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : tags
      : [];

    const pin = await Pin.create({
      title: title.trim(),
      description: description.trim(),
      prompt: prompt || null,
      link: link || null,
      board: board || "general",
      tags: tagsArray,
      media: media || originalMedia,
      originalMedia: originalMedia || media,
      originalUrl: originalUrl || null,
      uploadProvider: uploadProvider || "imagekit",
      width: pinWidth,
      height: pinHeight,
      resolution: resolution || `${pinWidth}x${pinHeight}`,
      deviceType: deviceType || "both",
      category: category || "general",
      user: session.user.id,
    });

    return Response.json(pin, { status: 201 });
  } catch (error) {
    console.error("Failed to create pin:", error);
    const message =
      error?.name === "ValidationError"
        ? Object.values(error.errors)
            .map((e) => e.message)
            .join("; ")
        : error?.message || "Failed to create pin";
    return Response.json({ success: false, message }, { status: 500 });
  }
}
