import { uploadWallpaper } from "@/lib/uploadWallpaper";

export function validateCreateForm({ file, uploadedMedia, title, description }) {
  if (!file && !uploadedMedia) {
    return { error: "Please select an image first" };
  }
  if (!title.trim() || !description.trim()) {
    return { error: "Title and description are required" };
  }
  return { ok: true };
}

export async function ensureUploadedMedia({
  file,
  uploadedMedia,
  onProgress,
  collectDraftPayload,
  apiRequest,
}) {
  if (uploadedMedia) return uploadedMedia;

  const mediaData = await uploadWallpaper(file, { onProgress });
  await apiRequest.post("/api/drafts", {
    ...collectDraftPayload(),
    media: mediaData.filePath,
    originalMedia: mediaData.originalMedia,
    originalUrl: mediaData.originalUrl,
    uploadProvider: mediaData.provider,
    width: mediaData.width,
    height: mediaData.height,
    resolution: `${mediaData.width}x${mediaData.height}`,
    fileName: file?.name || mediaData.name,
  });
  return mediaData;
}

export function buildPinPublishBody(options) {
  const {
    title,
    description,
    prompt,
    link,
    selectedAlbum,
    selectedTags,
    customTags,
    mediaData,
    deviceType,
    category,
    textOptions,
    canvasOptions,
  } = options;

  const allTags = [
    ...new Set([
      ...selectedTags,
      ...customTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    ]),
  ];

  return {
    title: title.trim(),
    description: description.trim(),
    prompt: prompt || null,
    link: link || null,
    board: selectedAlbum || null,
    tags: allTags.join(","),
    media: mediaData.filePath,
    originalMedia: mediaData.originalMedia,
    originalUrl: mediaData.originalUrl,
    uploadProvider: mediaData.provider,
    width: mediaData.width,
    height: mediaData.height,
    resolution: `${mediaData.width}x${mediaData.height}`,
    deviceType,
    category: category || "general",
    textOptions: JSON.stringify(textOptions),
    canvasOptions: JSON.stringify(canvasOptions),
  };
}

export async function publishCreatedPin({
  file,
  uploadedMedia,
  onProgress,
  collectDraftPayload,
  apiRequest,
  form,
  draftId,
}) {
  const mediaData = await ensureUploadedMedia({
    file,
    uploadedMedia,
    onProgress,
    collectDraftPayload,
    apiRequest,
  });

  const res = await apiRequest.post(
    "/api/pins",
    buildPinPublishBody({ ...form, mediaData })
  );

  if (draftId) {
    await apiRequest.delete(`/api/drafts/${draftId}`).catch(() => {
      // non-fatal: draft cleanup after publish
    });
  }

  return { mediaData, pin: res.data };
}
