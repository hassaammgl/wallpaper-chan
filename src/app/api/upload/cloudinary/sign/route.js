export const dynamic = "force-dynamic";

import crypto from "crypto";
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
    const isAvatar = purpose === "avatar";

    if (!isAvatar && session.user.role !== "admin") {
      return Response.json(
        { success: false, message: "Only admins can upload wallpapers" },
        { status: 403 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = isAvatar ? "avatars" : "wallpapers";

    const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto
      .createHash("sha1")
      .update(stringToSign)
      .digest("hex");

    return Response.json({
      timestamp,
      signature,
      folder,
      cloudName,
      apiKey,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to generate signature" },
      { status: 500 }
    );
  }
}
