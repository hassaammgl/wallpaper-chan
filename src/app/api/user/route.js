export const dynamic = "force-dynamic";

import { getSession } from "@/lib/getSession";
import { findUserById, updateUserById } from "@/lib/users";
import { isValidUsername, USERNAME_INVALID_MESSAGE } from "@/lib/validation";
import { handleApiError, AppError } from "@/lib/AppError";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await findUserById(session.user.id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return Response.json({ success: true, user });
  } catch (error) {
    return handleApiError(
      error instanceof AppError
        ? error
        : new AppError("Failed to fetch profile", 500)
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AppError("Unauthorized", 401);
    }

    const body = await request.json();
    const update = {};

    if (body.displayName !== undefined) {
      const displayName = String(body.displayName).trim();
      const fallback = String(body.userName || session.user.userName || "").trim();
      update.displayName = displayName || fallback;
    }

    if (body.userName !== undefined) {
      const userName = String(body.userName).trim();
      if (!isValidUsername(userName)) {
        throw new AppError(USERNAME_INVALID_MESSAGE, 400);
      }
      update.userName = userName;
    }

    if (body.img !== undefined) {
      update.img = body.img;
    }

    if (Object.keys(update).length === 0) {
      throw new AppError("No valid fields to update", 400);
    }

    const user = await updateUserById(session.user.id, update);
    return Response.json({
      success: true,
      message: "Profile updated",
      user,
    });
  } catch (error) {
    return handleApiError(
      error instanceof AppError
        ? error
        : new AppError(error.message || "Failed to update profile", 500)
    );
  }
}
