export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import Pin from "@/lib/models/pin.model";
import { enrichWithUsers } from "@/lib/users";
import {
  applyAdminPinUpdates,
  deletePinCascade,
} from "@/lib/adminPinActions";

export async function GET(_request, { params }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    await connectDB();

    const pin = await Pin.findById(id);
    if (!pin) {
      return Response.json(
        { success: false, message: "Pin not found" },
        { status: 404 }
      );
    }

    const [withUser] = await enrichWithUsers([pin], {
      fields: ["id", "displayName", "userName", "img"],
    });

    return Response.json({ success: true, data: withUser });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch pin" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    await connectDB();

    const pin = await Pin.findById(id);
    if (!pin) {
      return Response.json(
        { success: false, message: "Pin not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validationError = applyAdminPinUpdates(pin, body);
    if (validationError) {
      return Response.json(
        { success: false, message: validationError.message },
        { status: validationError.status }
      );
    }

    await pin.save();
    const [withUser] = await enrichWithUsers([pin], {
      fields: ["id", "displayName", "userName", "img"],
    });

    return Response.json({
      success: true,
      message: "Pin updated",
      data: withUser,
    });
  } catch (error) {
    console.error("Failed to update pin:", error);
    return Response.json(
      { success: false, message: error?.message || "Failed to update pin" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    await connectDB();

    const pin = await Pin.findById(id);
    if (!pin) {
      return Response.json(
        { success: false, message: "Pin not found" },
        { status: 404 }
      );
    }

    await deletePinCascade(id);

    return Response.json({ success: true, message: "Pin deleted" });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to delete pin" },
      { status: 500 }
    );
  }
}
