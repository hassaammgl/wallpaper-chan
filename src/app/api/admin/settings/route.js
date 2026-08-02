export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import SiteSettings from "@/lib/models/siteSettings.model";
import { requireAdmin } from "@/lib/requireAdmin";
import { handleApiError, AppError } from "@/lib/AppError";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

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
    return handleApiError(new AppError("Failed to fetch settings", 500));
  }
}

export async function PATCH(request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

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
    return handleApiError(new AppError("Failed to update settings", 500));
  }
}
