import { resolveMediaSrc } from "@/lib/mediaUrls";

export function mergeTags(selectedTags, customTags) {
  return [
    ...new Set([
      ...selectedTags,
      ...customTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    ]),
  ];
}

export function mediaFromDraft(draft) {
  return {
    provider: draft.uploadProvider || "imagekit",
    filePath: draft.media,
    originalMedia: draft.originalMedia || draft.media,
    originalUrl: draft.originalUrl || null,
    url: draft.originalUrl || null,
    width: draft.width || 0,
    height: draft.height || 0,
    name: draft.fileName || null,
  };
}

export function buildDraftMedia(draft) {
  if (!draft.media) {
    return {
      uploadedMedia: null,
      previewImg: { url: "", width: 0, height: 0 },
    };
  }

  const uploadedMedia = mediaFromDraft(draft);
  const previewUrl =
    resolveMediaSrc(draft.media, {
      provider: uploadedMedia.provider,
      width: 900,
      originalUrl: draft.originalUrl,
      originalMedia: draft.originalMedia || draft.media,
    }) ||
    draft.originalUrl ||
    "";

  return {
    uploadedMedia,
    previewImg: {
      url: previewUrl,
      width: draft.width || 800,
      height: draft.height || 0,
    },
  };
}

function resolutionFrom(uploadedMedia, previewImg) {
  if (uploadedMedia?.width && uploadedMedia?.height) {
    return `${uploadedMedia.width}x${uploadedMedia.height}`;
  }
  if (previewImg.width && previewImg.height) {
    return `${previewImg.width}x${previewImg.height}`;
  }
  return null;
}

export function buildDraftPayload(state) {
  const { draftId, uploadedMedia, previewImg, file } = state;
  return {
    id: draftId || undefined,
    title: state.title,
    description: state.description,
    prompt: state.prompt || "",
    link: state.link || "",
    board: state.selectedAlbum || "general",
    tags: mergeTags(state.selectedTags, state.customTags),
    deviceType: state.deviceType,
    category: state.category,
    media: uploadedMedia?.filePath || null,
    originalMedia:
      uploadedMedia?.originalMedia || uploadedMedia?.filePath || null,
    originalUrl: uploadedMedia?.originalUrl || uploadedMedia?.url || null,
    uploadProvider: uploadedMedia?.provider || null,
    width: uploadedMedia?.width || previewImg.width || null,
    height: uploadedMedia?.height || previewImg.height || null,
    resolution: resolutionFrom(uploadedMedia, previewImg),
    fileName: file?.name || uploadedMedia?.name || null,
  };
}
