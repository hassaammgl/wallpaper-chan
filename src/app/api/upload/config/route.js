export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import SiteSettings from "@/lib/models/siteSettings.model";

export async function GET() {
  try {
    await connectDB();
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({ uploadProvider: "imagekit" });
    }

    return Response.json({
      success: true,
      data: {
        provider: settings.uploadProvider,
        imagekit: {
          publicKey: process.env.NEXT_PUBLIC_IK_PUBLIC_KEY,
          urlEndpoint: process.env.NEXT_PUBLIC_IK_URL_ENDPOINT,
        },
        cloudinary: {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        },
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch config" },
      { status: 500 }
    );
  }
}
