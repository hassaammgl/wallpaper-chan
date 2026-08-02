import { resolveMediaSrc } from "@/lib/mediaUrls";
import { uploadWallpaper } from "@/lib/uploadWallpaper";
import { AVATAR_DISPLAY_WIDTH } from "@/lib/constants";
import { isValidUsername, USERNAME_INVALID_MESSAGE } from "@/lib/validation";

export function validateProfileForm({ displayName, userName }) {
  const trimmedUser = userName.trim();
  const trimmedName = displayName.trim();
  if (!trimmedUser) {
    return { error: "Username is required" };
  }
  if (!isValidUsername(trimmedUser)) {
    return { error: USERNAME_INVALID_MESSAGE };
  }
  return {
    displayName: trimmedName || trimmedUser,
    userName: trimmedUser,
  };
}

export async function resolveAvatarUpload(avatarFile, currentImg) {
  if (!avatarFile) return currentImg || null;

  const mediaData = await uploadWallpaper(avatarFile, {
    folder: "/avatars",
    purpose: "avatar",
  });

  let imgPath = mediaData.url || mediaData.originalUrl || mediaData.filePath;
  if (imgPath?.startsWith("/") && !imgPath.startsWith("/general/")) {
    imgPath =
      resolveMediaSrc(imgPath, {
        provider: mediaData.provider || "imagekit",
        width: AVATAR_DISPLAY_WIDTH,
        originalUrl: mediaData.originalUrl || mediaData.url,
      }) || imgPath;
  }
  return imgPath;
}
