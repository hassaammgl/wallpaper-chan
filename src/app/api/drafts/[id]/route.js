export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Draft from "@/lib/models/draft.model";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET(_request, { params }) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    await connectDB();

    const draft = await Draft.findOne({ _id: id, user: session.user.id });
    if (!draft) {
      return Response.json(
        { success: false, message: "Draft not found" },
        { status: 404 }
      );
    }

    return Response.json(draft);
  } catch (err) {
    return Response.json(
      { success: false, message: "Failed to fetch draft" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    await connectDB();

    const draft = await Draft.findOne({ _id: id, user: session.user.id });
    if (!draft) {
      return Response.json(
        { success: false, message: "Draft not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const fields = [
      "title",
      "description",
      "prompt",
      "link",
      "board",
      "deviceType",
      "category",
      "media",
      "originalMedia",
      "originalUrl",
      "uploadProvider",
      "width",
      "height",
      "resolution",
      "fileName",
    ];

    for (const key of fields) {
      if (body[key] !== undefined) draft[key] = body[key];
    }

    if (body.tags !== undefined) {
      draft.tags = Array.isArray(body.tags)
        ? body.tags.map((t) => String(t).trim()).filter(Boolean)
        : String(body.tags || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
    }

    await draft.save();
    return Response.json(draft);
  } catch (err) {
    return Response.json(
      { success: false, message: "Failed to update draft" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    await connectDB();

    const result = await Draft.deleteOne({ _id: id, user: session.user.id });
    if (!result.deletedCount) {
      return Response.json(
        { success: false, message: "Draft not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, message: "Draft deleted" });
  } catch (err) {
    return Response.json(
      { success: false, message: "Failed to delete draft" },
      { status: 500 }
    );
  }
}
