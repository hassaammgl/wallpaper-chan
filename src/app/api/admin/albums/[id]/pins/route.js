export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Board from "@/lib/models/board.model";
import Pin from "@/lib/models/pin.model";
import { requireAdmin } from "@/lib/requireAdmin";
import { enrichWithUsers } from "@/lib/users";

export async function GET(request, { params }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    await connectDB();

    const album = await Board.findById(id);
    if (!album) {
      return Response.json(
        { success: false, message: "Album not found" },
        { status: 404 }
      );
    }

    const boardId = album._id.toString();
    const pins = await Pin.find({
      $or: [{ board: boardId }, { board: album.title }],
    }).sort({ createdAt: -1 });

    const pinsWithUsers = await enrichWithUsers(pins, {
      fields: ["id", "displayName", "userName", "img"],
    });

    return Response.json({ success: true, pins: pinsWithUsers });
  } catch (err) {
    console.error("Admin album pins list failed:", err);
    return Response.json(
      { success: false, message: "Failed to fetch album wallpapers" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    await connectDB();

    const album = await Board.findById(id);
    if (!album) {
      return Response.json(
        { success: false, message: "Album not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      prompt,
      link,
      category,
      tags,
      media,
      originalMedia,
      originalUrl,
      uploadProvider,
      width,
      height,
      resolution,
      deviceType,
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
      board: album._id.toString(),
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
      user: album.user,
    });

    return Response.json({ success: true, data: pin }, { status: 201 });
  } catch (err) {
    console.error("Admin album pin create failed:", err);
    return Response.json(
      {
        success: false,
        message: err?.message || "Failed to add wallpaper",
      },
      { status: 500 }
    );
  }
}
