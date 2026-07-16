export const dynamic = "force-dynamic";

import { getSession } from "@/lib/getSession";
import { findUserById, updateUserById } from "@/lib/users";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await findUserById(session.user.id);
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, user });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
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
      if (!USERNAME_RE.test(userName)) {
        return Response.json(
          {
            success: false,
            message: "Username must be 3-30 characters (letters, numbers, underscore)",
          },
          { status: 400 }
        );
      }
      update.userName = userName;
    }

    if (body.img !== undefined) {
      update.img = body.img;
    }

    if (Object.keys(update).length === 0) {
      return Response.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 }
      );
    }

    const user = await updateUserById(session.user.id, update);

    return Response.json({
      success: true,
      message: "Profile updated",
      user,
    });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "Failed to update profile";
    return Response.json({ success: false, message }, { status });
  }
}
