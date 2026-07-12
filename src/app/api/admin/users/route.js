export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import { getSession } from "@/lib/getSession";
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

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 15);
    const search = searchParams.get("search");

    const query = {};
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { displayName: { $regex: search, $options: "i" } },
      ];
    }

    const result = await (await getAuth()).api.listUsers({
      query: { ...query, limit, offset: (page - 1) * limit },
    });

    const users = (result.users || []).map((u) => ({
      _id: u.id,
      displayName: u.displayName || u.name,
      userName: u.userName,
      email: u.email,
      img: u.img,
      role: u.role,
      createdAt: u.createdAt,
    }));

    const total = result.total || 0;
    const pages = Math.ceil(total / limit);

    return Response.json({
      success: true,
      data: { users, pages, total },
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
