export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Draft from "@/lib/models/draft.model";
import { requireAdmin } from "@/lib/requireAdmin";

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((t) => String(t).trim()).filter(Boolean);
  }
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

function buildDraftPayload(body = {}) {
  const payload = {};
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
    if (body[key] !== undefined) payload[key] = body[key];
  }

  if (body.tags !== undefined) payload.tags = normalizeTags(body.tags);

  if (payload.title !== undefined) payload.title = String(payload.title || "").trim();
  if (payload.description !== undefined) {
    payload.description = String(payload.description || "").trim();
  }
  if (payload.prompt !== undefined) {
    payload.prompt = payload.prompt ? String(payload.prompt).trim() : "";
  }
  if (payload.link !== undefined) {
    payload.link = payload.link ? String(payload.link).trim() : "";
  }
  if (payload.board !== undefined) {
    payload.board = payload.board || "general";
  }
  if (payload.deviceType !== undefined) {
    payload.deviceType = ["mobile", "desktop", "both"].includes(payload.deviceType)
      ? payload.deviceType
      : "both";
  }
  if (payload.width !== undefined && payload.width !== null) {
    payload.width = Number(payload.width) || null;
  }
  if (payload.height !== undefined && payload.height !== null) {
    payload.height = Number(payload.height) || null;
  }

  return payload;
}

export async function GET() {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    await connectDB();
    const drafts = await Draft.find({ user: session.user.id })
      .sort({ updatedAt: -1 })
      .limit(50);

    return Response.json(drafts);
  } catch (err) {
    console.error("Failed to fetch drafts:", err);
    return Response.json(
      { success: false, message: "Failed to fetch drafts" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    await connectDB();
    const body = await request.json();
    const payload = buildDraftPayload(body);

    // Resume/update existing draft when id is provided
    if (body.id || body._id) {
      const draftId = body.id || body._id;
      const existing = await Draft.findOne({
        _id: draftId,
        user: session.user.id,
      });
      if (!existing) {
        return Response.json(
          { success: false, message: "Draft not found" },
          { status: 404 }
        );
      }
      Object.assign(existing, payload);
      await existing.save();
      return Response.json(existing);
    }

    // If same media already has a draft, update that instead of creating duplicates
    if (payload.media) {
      const byMedia = await Draft.findOne({
        user: session.user.id,
        media: payload.media,
      });
      if (byMedia) {
        Object.assign(byMedia, payload);
        await byMedia.save();
        return Response.json(byMedia);
      }
    }

    const draft = await Draft.create({
      user: session.user.id,
      ...payload,
    });

    return Response.json(draft, { status: 201 });
  } catch (err) {
    console.error("Failed to save draft:", err);
    return Response.json(
      { success: false, message: err?.message || "Failed to save draft" },
      { status: 500 }
    );
  }
}
