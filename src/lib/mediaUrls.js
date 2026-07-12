const IK_ENDPOINT = process.env.NEXT_PUBLIC_IK_URL_ENDPOINT;
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export function getDownloadUrl(mediaKey, provider, originalUrl) {
  if (provider === "cloudinary") {
    return (
      originalUrl ||
      `https://res.cloudinary.com/${CLOUD}/image/upload/q_100,f_auto/${mediaKey}`
    );
  }
  return `${IK_ENDPOINT}${mediaKey}`;
}

export function getDisplayUrl(mediaKey, provider, width = 800) {
  if (provider === "cloudinary") {
    return `https://res.cloudinary.com/${CLOUD}/image/upload/c_limit,w_${width},q_auto:good,f_auto/${mediaKey}`;
  }
  return `${IK_ENDPOINT}${mediaKey}?tr=w-${width},q-80`;
}
