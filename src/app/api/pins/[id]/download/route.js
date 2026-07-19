export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Pin from "@/lib/models/pin.model";
import { getDownloadUrl } from "@/lib/mediaUrls";

function safeFilename(title) {
  const base = String(title || "wallpaper")
    .replace(/[^\w\s.-]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return `${base || "wallpaper"}.jpg`;
}

function extensionFromContentType(contentType = "") {
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("gif")) return ".gif";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return ".jpg";
  return null;
}

export async function GET(_request, { params }) {
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

    if (!downloadUrl) {
      return Response.json(
        { success: false, message: "Download URL not available" },
        { status: 404 }
      );
    }

    const upstream = await fetch(downloadUrl, {
      cache: "no-store",
    });

    if (!upstream.ok) {
      return Response.json(
        { success: false, message: "Failed to fetch wallpaper file" },
        { status: 502 }
      );
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    let filename = safeFilename(pin.title);
    const ext = extensionFromContentType(contentType);
    if (ext && !filename.toLowerCase().endsWith(ext)) {
      filename = filename.replace(/\.[a-z0-9]+$/i, "") + ext;
    }

    const bytes = await upstream.arrayBuffer();

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Download failed:", error);
    return Response.json(
      { success: false, message: "Failed to get download" },
      { status: 500 }
    );
  }
}
