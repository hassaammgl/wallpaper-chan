"use client";

import { useState } from "react";
import NextImage from "next/image";

const IK_ENDPOINT = process.env.NEXT_PUBLIC_IK_URL_ENDPOINT?.replace(/\/$/, "");
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const FALLBACK = "/general/noAvatar.svg";

const LOCAL_PATH_RE = /^\/(general|logo|_next|favicon)/i;

function buildCloudinaryDisplayUrl(publicId, { width = 1200 } = {}) {
  if (!CLOUD || !publicId) return "";
  const id = publicId.replace(/^\/+/, "");
  return `https://res.cloudinary.com/${CLOUD}/image/upload/c_limit,w_${width},q_auto:good,f_auto/${id}`;
}

function buildCloudinaryOriginalUrl(publicId) {
  if (!CLOUD || !publicId) return "";
  const id = publicId.replace(/^\/+/, "");
  return `https://res.cloudinary.com/${CLOUD}/image/upload/q_100,f_auto/${id}`;
}

function buildImageKitUrl(mediaKey, { width, mode } = {}) {
  if (!IK_ENDPOINT || !mediaKey) return null;
  const path = mediaKey.startsWith("/") ? mediaKey : `/${mediaKey}`;
  if (mode === "original") return `${IK_ENDPOINT}${path}`;
  return `${IK_ENDPOINT}${path}?tr=w-${width || 800},q-80`;
}

function isLocalPath(value) {
  return LOCAL_PATH_RE.test(value);
}

function resolveSrc({ path, src, uploadProvider, mode, pin, w }) {
  const raw = src || path || pin?.media;
  if (!raw) return null;

  if (raw.startsWith("blob:") || raw.startsWith("data:")) return raw;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (isLocalPath(raw)) return raw;

  const provider = uploadProvider || pin?.uploadProvider || "imagekit";
  const mediaKey = path || pin?.media || raw;
  const originalKey = pin?.originalMedia || mediaKey;

  if (provider === "cloudinary") {
    return mode === "original"
      ? pin?.originalUrl || buildCloudinaryOriginalUrl(originalKey)
      : buildCloudinaryDisplayUrl(mediaKey, { width: w || 1200 });
  }

  return buildImageKitUrl(
    mode === "original" ? originalKey : mediaKey,
    { width: w, mode }
  );
}

function resolveDimensions({ w, h, pin }) {
  const width = w || pin?.width || 800;
  const height =
    h ||
    (pin?.width && pin?.height
      ? Math.round((width * pin.height) / pin.width)
      : Math.round(width * 0.75));

  return { width, height };
}

function Image({
  path,
  src,
  alt = "",
  className = "",
  w,
  h,
  uploadProvider,
  mode = "display",
  pin,
  fill = false,
  priority = false,
  sizes,
}) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveSrc({ path, src, uploadProvider, mode, pin, w });
  const url = failed ? FALLBACK : resolved || FALLBACK;

  // next/image does not support blob/data URLs
  if (url.startsWith("blob:") || url.startsWith("data:")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt}
        className={className}
        width={w}
        height={h}
        onError={() => setFailed(true)}
      />
    );
  }

  const unoptimized =
    url.includes("ik.imagekit.io") || url.includes("res.cloudinary.com");

  if (fill) {
    return (
      <NextImage
        src={url}
        alt={alt}
        fill
        className={className}
        sizes={sizes || "(max-width: 768px) 50vw, 25vw"}
        priority={priority}
        unoptimized={unoptimized}
        onError={() => setFailed(true)}
      />
    );
  }

  const { width, height } = resolveDimensions({ w, h, pin });

  return (
    <NextImage
      src={url}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized}
      onError={() => setFailed(true)}
    />
  );
}

export default Image;
