export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import { getSession } from "@/lib/getSession";
import Pin from "@/lib/models/pin.model";

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
      .populate("user", "displayName userName img");

    return Response.json({
      success: true,
      data: { pins, pages, total },
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch pins" },
      { status: 500 }
    );
  }
}
