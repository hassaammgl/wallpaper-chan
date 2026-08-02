export const dynamic = "force-dynamic";

import { requireAdmin } from "@/lib/requireAdmin";
import { listUsers } from "@/lib/users";
import { handleApiError, AppError } from "@/lib/AppError";
import { ADMIN_USERS_PAGE_SIZE } from "@/lib/constants";

export async function GET(request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || ADMIN_USERS_PAGE_SIZE);
    const search = searchParams.get("search");

    const { users, total } = await listUsers({
      search,
      limit,
      offset: (page - 1) * limit,
    });

    return Response.json({
      success: true,
      data: { users, pages: Math.ceil(total / limit), total },
    });
  } catch (error) {
    return handleApiError(new AppError("Failed to fetch users", 500));
  }
}
