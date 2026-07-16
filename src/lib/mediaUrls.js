const IK_ENDPOINT = process.env.NEXT_PUBLIC_IK_URL_ENDPOINT?.replace(/\/$/, "");
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

const LOCAL_PREFIXES = ["/general/", "/logo", "/favicon", "/_next/"];

export function isLocalMediaPath(value) {
  if (!value || typeof value !== "string") return false;
  return LOCAL_PREFIXES.some((prefix) => value.startsWith(prefix));
}

export function isCdnPath(value) {
  if (!value || typeof value !== "string") return false;
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:") ||
    value.startsWith("data:")
  );
}

function buildImageKitUrl(mediaKey, { width = 800, mode = "display" } = {}) {
  if (!IK_ENDPOINT || !mediaKey) return null;
  const path = mediaKey.startsWith("/") ? mediaKey : `/${mediaKey}`;
  if (mode === "original") return `${IK_ENDPOINT}${path}`;
  return `${IK_ENDPOINT}${path}?tr=w-${width},q-80`;
}

function buildCloudinaryDisplayUrl(publicId, { width = 1200 } = {}) {
  if (!CLOUD || !publicId) return null;
  const id = String(publicId).replace(/^\/+/, "");
  return `https://res.cloudinary.com/${CLOUD}/image/upload/c_limit,w_${width},q_auto:good,f_auto/${id}`;
}

function buildCloudinaryOriginalUrl(publicId) {
  if (!CLOUD || !publicId) return null;
  const id = String(publicId).replace(/^\/+/, "");
  return `https://res.cloudinary.com/${CLOUD}/image/upload/q_100,f_auto/${id}`;
}

export function resolveMediaSrc(
  mediaKey,
  {
    provider = "imagekit",
    mode = "display",
    width = 800,
    originalUrl,
    originalMedia,
  } = {}
) {
  if (!mediaKey) return null;

  if (isCdnPath(mediaKey)) return mediaKey;
  if (isLocalMediaPath(mediaKey)) return mediaKey;

  if (provider === "cloudinary") {
    const key = mediaKey;
    const originalKey = originalMedia || key;
    return mode === "original"
      ? originalUrl || buildCloudinaryOriginalUrl(originalKey)
      : buildCloudinaryDisplayUrl(key, { width });
  }

  const key = mode === "original" ? originalMedia || mediaKey : mediaKey;
  return buildImageKitUrl(key, { width, mode });
}

export function getDownloadUrl(mediaKey, provider, originalUrl) {
  return (
    resolveMediaSrc(mediaKey, {
      provider,
      mode: "original",
      originalUrl,
      originalMedia: mediaKey,
    }) || ""
  );
}

export function getDisplayUrl(mediaKey, provider, width = 800) {
  return resolveMediaSrc(mediaKey, { provider, mode: "display", width }) || "";
}
