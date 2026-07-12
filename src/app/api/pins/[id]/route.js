export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Pin from "@/lib/models/pin.model";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const pin = await Pin.findById(id).populate(
      "user",
      "displayName userName img"
    );

    if (!pin) {
      return Response.json(
        { success: false, message: "Pin not found" },
        { status: 404 }
      );
    }

    return Response.json(pin);
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch pin" },
      { status: 500 }
    );
  }
}
