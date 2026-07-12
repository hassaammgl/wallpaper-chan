"use client";

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
}) {
  const provider = uploadProvider || pin?.uploadProvider || "imagekit";
  const mediaKey = path || pin?.media;
  const originalKey = pin?.originalMedia || mediaKey;

  if (provider === "cloudinary") {
    const url =
      mode === "original"
        ? pin?.originalUrl || buildCloudinaryOriginalUrl(originalKey)
        : buildCloudinaryDisplayUrl(mediaKey, { width: w || 1200 });

    return (
      <img
        src={url || src}
        alt={alt}
        className={className}
        width={w}
        height={h}
        loading="lazy"
      />
    );
  }

  if (src?.startsWith("http") || src?.startsWith("blob:")) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        width={w}
        height={h}
        loading="lazy"
      />
    );
  }

  if (!mediaKey || !IK_ENDPOINT) {
    return <div className={`bg-panel ${className}`} />;
  }

  const url =
    mode === "original"
      ? `${IK_ENDPOINT}${originalKey}`
      : `${IK_ENDPOINT}${mediaKey}?tr=w-${w || 800},q-80`;

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      width={w}
      height={h}
      loading="lazy"
    />
  );
}

export default Image;
