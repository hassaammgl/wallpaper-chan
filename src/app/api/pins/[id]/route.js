export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Pin from "@/lib/models/pin.model";
import { enrichWithUsers } from "@/lib/users";

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

    const [withUser] = await enrichWithUsers([pin]);
    return Response.json(withUser);
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch pin" },
      { status: 500 }
    );
  }
}
