export const dynamic = "force-dynamic";

import crypto from "crypto";

export async function GET() {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "wallpapers";

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
