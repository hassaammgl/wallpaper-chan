export const dynamic = "force-dynamic";

import { getSession } from "@/lib/getSession";
import { listUsers } from "@/lib/users";

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

    const { users, total } = await listUsers({
      search,
      limit,
      offset: (page - 1) * limit,
    });

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
