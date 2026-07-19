export const dynamic = "force-dynamic";

import imagekit from "@/lib/imagekit";
import { getSession } from "@/lib/getSession";

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const purpose = searchParams.get("purpose") || "wallpaper";

    // Wallpaper CDN uploads are admin-only; avatars allowed for any signed-in user
    if (purpose !== "avatar" && session.user.role !== "admin") {
      return Response.json(
        { success: false, message: "Only admins can upload wallpapers" },
        { status: 403 }
      );
    }

    const result = imagekit.getAuthenticationParameters();
    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to get auth params" },
      { status: 500 }
    );
  }
}
