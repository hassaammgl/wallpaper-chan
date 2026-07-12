export const dynamic = "force-dynamic";

import { getSession } from "@/lib/getSession";
import { getAuth } from "@/lib/auth";

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
    const allowedFields = {};
    if (body.displayName !== undefined) allowedFields.displayName = body.displayName;
    if (body.userName !== undefined) allowedFields.userName = body.userName;
    if (body.img !== undefined) allowedFields.img = body.img;

    if (Object.keys(allowedFields).length === 0) {
      return Response.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 }
      );
    }

    await (await getAuth()).api.updateUser({
      userId: session.user.id,
      fields: allowedFields,
    });

    return Response.json({ success: true, message: "Profile updated" });
  } catch (error) {
    const message =
      error?.body?.message || error?.message || "Failed to update profile";
    const status = error?.body?.status || 500;
    return Response.json({ success: false, message }, { status });
  }
}
