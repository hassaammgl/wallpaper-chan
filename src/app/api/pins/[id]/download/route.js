export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Pin from "@/lib/models/pin.model";
import { getDownloadUrl } from "@/lib/mediaUrls";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const pin = await Pin.findById(id);

    if (!pin) {
      return Response.json(
        { success: false, message: "Pin not found" },
        { status: 404 }
      );
    }

    const downloadUrl = getDownloadUrl(
      pin.originalMedia || pin.media,
      pin.uploadProvider,
      pin.originalUrl
    );

    return Response.json({
      downloadUrl,
      filename: `${pin.title || "wallpaper"}.jpg`,
      resolution: pin.resolution || `${pin.width}x${pin.height}`,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to get download" },
      { status: 500 }
    );
  }
}
