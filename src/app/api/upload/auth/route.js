export const dynamic = "force-dynamic";

import imagekit from "@/lib/imagekit";

export async function GET() {
  try {
    const result = imagekit.getAuthenticationParameters();
    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to get auth params" },
      { status: 500 }
    );
  }
}
