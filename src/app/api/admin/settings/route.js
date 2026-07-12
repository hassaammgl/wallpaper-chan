export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import { getSession } from "@/lib/getSession";
import SiteSettings from "@/lib/models/siteSettings.model";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({ uploadProvider: "imagekit" });
    }

    return Response.json({
      success: true,
      data: { uploadProvider: settings.uploadProvider },
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const { uploadProvider } = await request.json();

    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({ uploadProvider });
    } else {
      settings.uploadProvider = uploadProvider;
      await settings.save();
    }

    return Response.json({
      success: true,
      data: { uploadProvider: settings.uploadProvider },
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to update settings" },
      { status: 500 }
    );
  }
}
