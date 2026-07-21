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

function withImageKitWidth(url, width, mode = "display") {
  if (!url || mode === "original") return url;
  if (!/imagekit\.io/i.test(url)) return url;
  const base = String(url).split("?")[0];
  return `${base}?tr=w-${width},q-80`;
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
  const key = mediaKey || originalMedia;
  if (!key && !originalUrl) return null;

  if (key && isCdnPath(key)) {
    return mode === "original" ? key : withImageKitWidth(key, width, mode);
  }
  if (key && isLocalMediaPath(key)) return key;

  if (provider === "cloudinary") {
    const cloudKey = key || originalMedia;
    const originalKey = originalMedia || cloudKey;
    return mode === "original"
      ? originalUrl || buildCloudinaryOriginalUrl(originalKey)
      : buildCloudinaryDisplayUrl(cloudKey, { width });
  }

  // Prefer the absolute URL saved at upload — works even if public IK env is missing client-side
  if (originalUrl && isCdnPath(originalUrl)) {
    return mode === "original"
      ? originalUrl
      : withImageKitWidth(originalUrl, width, mode);
  }

  const pathKey = mode === "original" ? originalMedia || key : key;
  return buildImageKitUrl(pathKey, { width, mode });
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
