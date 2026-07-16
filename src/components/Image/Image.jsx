"use client";

import NextImage from "next/image";

const IK_ENDPOINT = process.env.NEXT_PUBLIC_IK_URL_ENDPOINT;
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

function buildCloudinaryDisplayUrl(publicId, { width = 1200 } = {}) {
  if (!CLOUD || !publicId) return "";
  return `https://res.cloudinary.com/${CLOUD}/image/upload/c_limit,w_${width},q_auto:good,f_auto/${publicId}`;
}

function buildCloudinaryOriginalUrl(publicId) {
  if (!CLOUD || !publicId) return "";
  return `https://res.cloudinary.com/${CLOUD}/image/upload/q_100,f_auto/${publicId}`;
}

function resolveSrc({ path, src, uploadProvider, mode, pin, w }) {
  if (src) return src;

  const mediaKey = path || pin?.media;
  if (!mediaKey) return null;
  if (mediaKey.startsWith("/")) return mediaKey;

  const provider = uploadProvider || pin?.uploadProvider || "imagekit";
  const originalKey = pin?.originalMedia || mediaKey;

  if (provider === "cloudinary") {
    return mode === "original"
      ? pin?.originalUrl || buildCloudinaryOriginalUrl(originalKey)
      : buildCloudinaryDisplayUrl(mediaKey, { width: w || 1200 });
  }

  if (!IK_ENDPOINT) return null;

  return mode === "original"
    ? `${IK_ENDPOINT}${originalKey}`
    : `${IK_ENDPOINT}${mediaKey}?tr=w-${w || 800},q-80`;
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
  const url = resolveSrc({ path, src, uploadProvider, mode, pin, w });

  if (!url) {
    return <div className={`bg-panel ${className}`} aria-hidden={!alt} />;
  }

  // next/image does not support blob URLs
  if (url.startsWith("blob:")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={alt} className={className} width={w} height={h} />
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
    />
  );
}

export default Image;
