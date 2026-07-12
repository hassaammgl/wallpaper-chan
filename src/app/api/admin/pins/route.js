export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import { getSession } from "@/lib/getSession";
import Pin from "@/lib/models/pin.model";
import { getAuth } from "@/lib/auth";

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 12);
    const search = searchParams.get("search");

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const total = await Pin.countDocuments(query);
    const pages = Math.ceil(total / limit);

    const pins = await Pin.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "displayName userName img blocked");

    const auth = await getAuth();
    const blockedUsers = await auth.api.listUsers({
      query: { blocked: true, limit: 1000 },
    });
    const blockedIds = new Set((blockedUsers.users || []).map((u) => u.id));

    const pinsWithStatus = pins.map((pin) => ({
      ...pin.toObject(),
      userBlocked: pin.user ? blockedIds.has(pin.user._id?.toString() || pin.user.id) : false,
    }));

    return Response.json({
      success: true,
      data: { pins: pinsWithStatus, pages, total },
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch pins" },
      { status: 500 }
    );
  }
}
