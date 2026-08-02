import mongoose from "mongoose";
import { getAccessibleAlbum, albumPinQuery } from "@/lib/albumAccess";
import { getBlockedUserIds } from "@/lib/users";

export function buildPinSearchClause(search) {
  if (!search) return null;
  return {
    $or: [
      { title: { $regex: search, $options: "i" } },
      { tags: { $in: [new RegExp(search, "i")] } },
      { category: { $regex: search, $options: "i" } },
    ],
  };
}

export function normalizePinTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
  return String(tags)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function parsePinDimensions(width, height) {
  const pinWidth = Number(width);
  const pinHeight = Number(height);
  if (!Number.isFinite(pinWidth) || !Number.isFinite(pinHeight)) {
    return { error: "Image dimensions are required" };
  }
  return { pinWidth, pinHeight };
}

export async function applyAlbumFilter(query, boardId) {
  if (!boardId) return null;
  if (!mongoose.isValidObjectId(boardId)) {
    query.board = boardId;
    return null;
  }
  const { album, status, message } = await getAccessibleAlbum(boardId);
  if (!album) {
    return { status, message };
  }
  Object.assign(query, albumPinQuery(album));
  return null;
}

export async function applyUserVisibilityFilter(query, { userId, boardId }) {
  try {
    const blockedIds = await getBlockedUserIds();
    if (userId) {
      if (blockedIds.includes(userId)) {
        return { empty: true };
      }
      if (boardId && query.user && query.user !== userId) {
        return { empty: true };
      }
      if (!boardId) query.user = userId;
      return null;
    }
    if (blockedIds.length > 0 && !boardId) {
      query.user = { $nin: blockedIds };
    }
  } catch {
    // non-fatal: blocked-user filter unavailable
    if (userId && !boardId) query.user = userId;
  }
  return null;
}

export function validatePinCreateBody(body) {
  const { title, description, media, originalMedia, width, height } = body;
  if (!title?.trim() || !description?.trim()) {
    return { error: "Title and description are required" };
  }
  if (!media && !originalMedia) {
    return { error: "Image upload is required" };
  }
  const dims = parsePinDimensions(width, height);
  if (dims.error) return dims;
  return { ...dims, ok: true };
}
