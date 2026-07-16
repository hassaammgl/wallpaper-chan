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
  const [failed, setFailed] = useState(false);

  const mediaKey = src || path || pin?.media;
  const provider = uploadProvider || pin?.uploadProvider || "imagekit";

  const resolved =
    mediaKey && !failed
      ? resolveMediaSrc(mediaKey, {
          provider,
          mode,
          width: w || 800,
          originalUrl: pin?.originalUrl,
          originalMedia: pin?.originalMedia,
        })
      : null;

  const url = resolved || FALLBACK;
  const useNativeImg =
    url.startsWith("blob:") ||
    url.startsWith("data:") ||
    (!isLocalMediaPath(url) && isCdnPath(url));

  if (useNativeImg) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt}
          className={`absolute inset-0 h-full w-full ${className}`}
          onError={() => setFailed(true)}
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
        onError={() => setFailed(true)}
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
      onError={() => setFailed(true)}
    />
  );
}

export default Image;
