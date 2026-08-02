export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Pin from "@/lib/models/pin.model";
import { enrichWithUsers } from "@/lib/users";
import { requireAdmin } from "@/lib/requireAdmin";
import { handleApiError, AppError } from "@/lib/AppError";
import { PINS_PAGE_SIZE } from "@/lib/constants";
import {
  buildPinSearchClause,
  applyAlbumFilter,
  applyUserVisibilityFilter,
  normalizePinTags,
  validatePinCreateBody,
} from "@/lib/pinQuery";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const cursor = Number(searchParams.get("cursor") || 0);
    const search = searchParams.get("search");
    const userId = searchParams.get("userId");
    const boardId = searchParams.get("boardId");
    const deviceType = searchParams.get("deviceType");

    const query = {};
    const searchClause = buildPinSearchClause(search);
    if (searchClause) Object.assign(query, searchClause);

    const albumDenied = await applyAlbumFilter(query, boardId);
    if (albumDenied) {
      return Response.json(
        {
          success: false,
          message: albumDenied.message,
          pins: [],
          nextCursor: null,
        },
        { status: albumDenied.status }
      );
    }

    if (deviceType) {
      query.deviceType = { $in: [deviceType, "both"] };
    }

    const visibility = await applyUserVisibilityFilter(query, {
      userId,
      boardId,
    });
    if (visibility?.empty) {
      return Response.json({ pins: [], nextCursor: null });
    }

    const pins = await Pin.find(query)
      .sort({ createdAt: -1 })
      .skip(cursor)
      .limit(PINS_PAGE_SIZE + 1);

    const hasMore = pins.length > PINS_PAGE_SIZE;
    const page = hasMore ? pins.slice(0, PINS_PAGE_SIZE) : pins;

    return Response.json({
      pins: await enrichWithUsers(page),
      nextCursor: hasMore ? cursor + PINS_PAGE_SIZE : null,
    });
  } catch (error) {
    return handleApiError(
      error instanceof AppError
        ? error
        : new AppError("Failed to fetch pins", 500)
    );
  }
}

export async function POST(request) {
  try {
    const { session, error } = await requireAdmin();
    if (error) {
      // Upload is admin-only; keep a clearer message than generic admin gate
      if (error.status === 403) {
        return Response.json(
          { success: false, message: "Only admins can upload wallpapers" },
          { status: 403 }
        );
      }
      return error;
    }

    await connectDB();
    const body = await request.json();
    const validated = validatePinCreateBody(body);
    if (validated.error) {
      throw new AppError(validated.error, 400);
    }

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
      resolution,
      deviceType,
      category,
    } = body;

    const { pinWidth, pinHeight } = validated;
    const pin = await Pin.create({
      title: title.trim(),
      description: description.trim(),
      prompt: prompt || null,
      link: link || null,
      board: board || "general",
      tags: normalizePinTags(tags),
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
    if (error?.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((e) => e.message)
        .join("; ");
      return handleApiError(new AppError(message, 500));
    }
    return handleApiError(
      error instanceof AppError
        ? error
        : new AppError(error?.message || "Failed to create pin", 500)
    );
  }
}
