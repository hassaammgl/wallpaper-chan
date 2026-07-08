const IK_ENDPOINT = import.meta.env.VITE_URL_IK_ENDPOINT;

function buildCloudinaryDisplayUrl(publicId, { width = 400 } = {}) {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (!cloud || !publicId) return '';
  return `https://res.cloudinary.com/${cloud}/image/upload/c_limit,w_${width},q_auto:good,f_auto/${publicId}`;
}

function Image({ path, pin, alt = '', className = '', w, h }) {
  const provider = pin?.uploadProvider || 'imagekit';
  const mediaKey = path || pin?.media;

  if (provider === 'cloudinary') {
    const url = buildCloudinaryDisplayUrl(mediaKey, { width: w || 400 });
    return <img src={url} alt={alt} className={className} width={w} height={h} loading="lazy" />;
  }

  if (!mediaKey || !IK_ENDPOINT) {
    return <div className={`bg-panel ${className}`} />;
  }

  const url = `${IK_ENDPOINT?.replace(/\/$/, '')}${mediaKey}?tr=w-${w || 400},q-80`;
  return <img src={url} alt={alt} className={className} width={w} height={h} loading="lazy" />;
}

export default Image;
