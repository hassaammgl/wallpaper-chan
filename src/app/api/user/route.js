export const dynamic = "force-dynamic";

import { headers } from "next/headers";
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
    const updateBody = {};
    if (body.displayName !== undefined) updateBody.displayName = body.displayName;
    if (body.userName !== undefined) updateBody.userName = body.userName;
    if (body.img !== undefined) updateBody.img = body.img;

    if (Object.keys(updateBody).length === 0) {
      return Response.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 }
      );
    }

    const headersList = await headers();
    const plainHeaders = Object.fromEntries(headersList.entries());

    await (await getAuth()).api.updateUser({
      body: updateBody,
      headers: plainHeaders,
    });

    return Response.json({ success: true, message: "Profile updated" });
  } catch (error) {
    const message =
      error?.body?.message || error?.message || "Failed to update profile";
    const status = error?.body?.status || 500;
    return Response.json({ success: false, message }, { status });
  }
}
