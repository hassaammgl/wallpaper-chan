"use client";

import { upload } from "@imagekit/javascript";
import apiRequest from "./apiRequest";

export async function uploadToImageKit(file, { folder = "/wallpapers", onProgress, publicKey: pk } = {}) {
  const [authRes, configRes] = await Promise.all([
    apiRequest.get("/api/upload/auth"),
    pk ? null : apiRequest.get("/api/upload/config"),
  ]);
  const { token, signature, expire } = authRes.data.data;

  const publicKey = pk || configRes.data.data.imagekit?.publicKey || process.env.NEXT_PUBLIC_IK_PUBLIC_KEY;

  const result = await upload({
    file,
    fileName: file.name,
    folder,
    useUniqueFileName: true,
    publicKey,
    token,
    signature,
    expire,
    onProgress: onProgress
      ? (event) =>
          onProgress(Math.round((event.loaded / event.total) * 100))
      : undefined,
  });

  return {
    provider: "imagekit",
    filePath: result.filePath,
    originalMedia: result.filePath,
    url: result.url,
    originalUrl: result.url,
    width: result.width,
    height: result.height,
    name: result.name,
  };
}

export async function uploadToCloudinary(file, { onProgress } = {}) {
  const { data: signRes } = await apiRequest.get(
    "/api/upload/cloudinary/sign"
  );
  const { timestamp, signature, folder, cloudName, apiKey } = signRes.data;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const xhr = new XMLHttpRequest();

  const result = await new Promise((resolve, reject) => {
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error("Cloudinary upload failed"));
      }
    });
    xhr.addEventListener("error", () =>
      reject(new Error("Cloudinary upload failed"))
    );
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
    );
    xhr.send(formData);
  });

  return {
    provider: "cloudinary",
    filePath: result.public_id,
    originalMedia: result.public_id,
    url: result.secure_url,
    originalUrl: result.secure_url,
    width: result.width,
    height: result.height,
    name: result.original_filename,
  };
}

export async function uploadWallpaper(file, { onProgress, folder } = {}) {
  const { data: configRes } = await apiRequest.get("/api/upload/config");
  const { provider, imagekit } = configRes.data;

  if (provider === "cloudinary") {
    return uploadToCloudinary(file, { onProgress });
  }
  return uploadToImageKit(file, { onProgress, folder, publicKey: imagekit?.publicKey });
}
