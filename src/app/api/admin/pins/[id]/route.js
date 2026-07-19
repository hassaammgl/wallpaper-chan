export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import Pin from "@/lib/models/pin.model";
import Comment from "@/lib/models/comment.model";
import Like from "@/lib/models/like.model";
import Save from "@/lib/models/save.model";
import { enrichWithUsers } from "@/lib/users";

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
    const allowed = [
      "title",
      "description",
      "prompt",
      "link",
      "board",
      "tags",
      "deviceType",
      "category",
      "resolution",
    ];

    for (const key of allowed) {
      if (body[key] === undefined) continue;

      if (key === "title" || key === "description") {
        const value = String(body[key] || "").trim();
        if (!value) {
          return Response.json(
            { success: false, message: `${key} is required` },
            { status: 400 }
          );
        }
        pin[key] = value;
        continue;
      }

      if (key === "tags") {
        pin.tags = Array.isArray(body.tags)
          ? body.tags.map((t) => String(t).trim()).filter(Boolean)
          : String(body.tags || "")
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean);
        continue;
      }

      if (key === "deviceType") {
        if (!["mobile", "desktop", "both"].includes(body.deviceType)) {
          return Response.json(
            { success: false, message: "Invalid device type" },
            { status: 400 }
          );
        }
        pin.deviceType = body.deviceType;
        continue;
      }

      if (key === "prompt" || key === "link") {
        pin[key] = body[key] ? String(body[key]).trim() : null;
        continue;
      }

      pin[key] = body[key];
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

    await Pin.deleteOne({ _id: id });
    await Comment.deleteMany({ pin: id });
    await Like.deleteMany({ pin: id });
    await Save.deleteMany({ pin: id });

    return Response.json({ success: true, message: "Pin deleted" });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to delete pin" },
      { status: 500 }
    );
  }
}
