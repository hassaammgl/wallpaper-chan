import Pin from "@/lib/models/pin.model";
import Comment from "@/lib/models/comment.model";
import Like from "@/lib/models/like.model";
import Save from "@/lib/models/save.model";

const ALLOWED_FIELDS = [
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

function parseTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((t) => String(t).trim()).filter(Boolean);
  }
  return String(tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function applyRequiredText(pin, key, value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return { message: `${key} is required`, status: 400 };
  }
  pin[key] = trimmed;
  return null;
}

function applyField(pin, key, body) {
  if (key === "title" || key === "description") {
    return applyRequiredText(pin, key, body[key]);
  }
  if (key === "tags") {
    pin.tags = parseTags(body.tags);
    return null;
  }
  if (key === "deviceType") {
    if (!["mobile", "desktop", "both"].includes(body.deviceType)) {
      return { message: "Invalid device type", status: 400 };
    }
    pin.deviceType = body.deviceType;
    return null;
  }
  if (key === "prompt" || key === "link") {
    pin[key] = body[key] ? String(body[key]).trim() : null;
    return null;
  }
  pin[key] = body[key];
  return null;
}

/** Mutates pin from body. Returns { message, status } on validation error. */
export function applyAdminPinUpdates(pin, body) {
  for (const key of ALLOWED_FIELDS) {
    if (body[key] === undefined) continue;
    const err = applyField(pin, key, body);
    if (err) return err;
  }
  return null;
}

export async function deletePinCascade(id) {
  await Pin.deleteOne({ _id: id });
  await Comment.deleteMany({ pin: id });
  await Like.deleteMany({ pin: id });
  await Save.deleteMany({ pin: id });
}
