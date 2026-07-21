"use client";

import { useState } from "react";
import NextImage from "next/image";
import { isCdnPath, isLocalMediaPath, resolveMediaSrc } from "@/lib/mediaUrls";

const FALLBACK = "/general/noAvatar.svg";

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
  const [attempt, setAttempt] = useState(0);

  const mediaKey = src || path || pin?.media;
  const provider = uploadProvider || pin?.uploadProvider || "imagekit";
  const originalUrl = pin?.originalUrl;

  const candidates = [];
  const primary = resolveMediaSrc(mediaKey, {
    provider,
    mode,
    width: w || 800,
    originalUrl,
    originalMedia: pin?.originalMedia,
  });
  if (primary) candidates.push(primary);
  if (originalUrl && isCdnPath(originalUrl) && !candidates.includes(originalUrl)) {
    candidates.push(originalUrl);
  }
  candidates.push(FALLBACK);

  const url = candidates[Math.min(attempt, candidates.length - 1)] || FALLBACK;

  const useNativeImg =
    url.startsWith("blob:") ||
    url.startsWith("data:") ||
    (!isLocalMediaPath(url) && isCdnPath(url));

  const onError = () => {
    setAttempt((prev) => Math.min(prev + 1, candidates.length - 1));
  };

  if (useNativeImg) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt}
          className={`absolute inset-0 h-full w-full ${className}`}
          onError={onError}
        />
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt}
        className={className}
        width={w}
        height={h}
        onError={onError}
      />
    );
  }

  if (fill) {
    return (
      <NextImage
        src={url}
        alt={alt}
        fill
        className={className}
        sizes={sizes || "(max-width: 768px) 50vw, 25vw"}
        priority={priority}
        onError={onError}
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
      onError={onError}
    />
  );
}

export default Image;
