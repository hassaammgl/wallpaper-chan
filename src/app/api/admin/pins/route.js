export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Pin from "@/lib/models/pin.model";
import { enrichWithUsers, getBlockedUserIds } from "@/lib/users";
import { requireAdmin } from "@/lib/requireAdmin";
import { handleApiError, AppError } from "@/lib/AppError";
import { ADMIN_PINS_PAGE_SIZE } from "@/lib/constants";

function buildAdminPinSearch(search) {
  if (!search) return {};
  return {
    $or: [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $in: [new RegExp(search, "i")] } },
    ],
  };
}

export async function GET(request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || ADMIN_PINS_PAGE_SIZE);
    const query = buildAdminPinSearch(searchParams.get("search"));

    const total = await Pin.countDocuments(query);
    const pins = await Pin.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const pinsWithUsers = await enrichWithUsers(pins, {
      fields: ["id", "displayName", "userName", "img", "blocked"],
    });
    const blockedIds = new Set(await getBlockedUserIds());

    return Response.json({
      success: true,
      data: {
        pins: pinsWithUsers.map((pin) => ({
          ...pin,
          userBlocked: pin.user?.id ? blockedIds.has(pin.user.id) : false,
        })),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    return handleApiError(new AppError("Failed to fetch pins", 500));
  }
}
