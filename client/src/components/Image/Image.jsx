import { IKImage } from 'imagekitio-react';

const IK_ENDPOINT = import.meta.env.VITE_URL_IK_ENDPOINT;

function buildCloudinaryDisplayUrl(publicId, { width = 1200 } = {}) {
    const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloud || !publicId) return '';
    const transforms = `c_limit,w_${width},q_auto:good,f_auto`;
    return `https://res.cloudinary.com/${cloud}/image/upload/${transforms}/${publicId}`;
}

function buildCloudinaryOriginalUrl(publicId) {
    const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloud || !publicId) return '';
    return `https://res.cloudinary.com/${cloud}/image/upload/q_100,f_auto/${publicId}`;
}

function Image({
    path,
    src,
    alt = '',
    className = '',
    w,
    h,
    uploadProvider,
    mode = 'display',
    pin,
}) {
    const provider = uploadProvider || pin?.uploadProvider || 'imagekit';
    const mediaKey = path || pin?.media;
    const originalKey = pin?.originalMedia || mediaKey;

    if (provider === 'cloudinary') {
        const url = mode === 'original'
            ? (pin?.originalUrl || buildCloudinaryOriginalUrl(originalKey))
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

    if (src?.startsWith('http') || src?.startsWith('blob:')) {
        return <img src={src} alt={alt} className={className} width={w} height={h} loading="lazy" />;
    }

    return (
        <IKImage
            urlEndpoint={IK_ENDPOINT}
            path={mode === 'original' ? originalKey : mediaKey}
            src={src}
            transformation={mode === 'display' ? [{ width: w || 800, quality: 80 }] : []}
            lqip={mode === 'display' ? { active: true, quality: 20 } : undefined}
            loading="lazy"
            alt={alt}
            className={className}
        />
    );
}

export default Image;
