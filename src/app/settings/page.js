"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "@/components/Image/Image";
import useAuthStore from "@/stores/authStore";
import apiRequest from "@/lib/apiRequest";
import { uploadWallpaper } from "@/lib/uploadWallpaper";
import {
  HiUser,
  HiCheckCircle,
  HiExclamationTriangle,
  HiCamera,
} from "react-icons/hi2";

function SettingsPage() {
  const { currentUser, updateCurrentUser } = useAuthStore();
  const router = useRouter();
  const fileInputRef = useRef();

  const [displayName, setDisplayName] = useState(
    currentUser?.displayName || ""
  );
  const [userName, setUserName] = useState(currentUser?.userName || "");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      let imgPath = currentUser?.img || null;

      if (avatarFile) {
        setUploading(true);
        const mediaData = await uploadWallpaper(avatarFile, { folder: "/avatars" });
        imgPath = mediaData.filePath;
        setUploading(false);
      }

      const fields = { displayName, userName };
      if (imgPath !== currentUser?.img) {
        fields.img = imgPath;
      }

      await apiRequest.patch("/api/user", fields);
      updateCurrentUser({ ...currentUser, ...fields });
      setAvatarFile(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to update profile"
      );
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-lg text-muted">Sign in to access settings</p>
        <button
          onClick={() => router.push("/auth")}
          className="btn-primary px-6 py-2.5 text-sm"
        >
          Sign in
        </button>
      </div>
    );
  }

  const displayImg = avatarPreview || currentUser.img || "/general/noAvatar.png";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-accent">
          <HiUser size={14} />
          Settings
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-fog">
          Account <span className="text-gradient">Settings</span>
        </h1>
      </div>

      {/* Profile Card */}
      <div className="rounded-[28px] border border-line glass p-8">
        {/* Avatar Upload */}
        <div className="mb-8 flex items-center gap-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative shrink-0"
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="avatar preview"
                className="h-20 w-20 rounded-2xl object-cover ring-4 ring-accent/20"
              />
            ) : (
              <Image
                path={currentUser.img || "/general/noAvatar.png"}
                alt="avatar"
                className="h-20 w-20 rounded-2xl object-cover ring-4 ring-accent/20"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-ink/50 opacity-0 transition-opacity group-hover:opacity-100">
              <HiCamera size={24} className="text-white" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
            />
          </button>
          <div>
            <h2 className="text-xl font-bold text-fog">
              {currentUser.displayName || currentUser.userName}
            </h2>
            <p className="text-sm text-muted">@{currentUser.userName}</p>
            <p className="mt-1 text-xs text-muted/60">{currentUser.email}</p>
            {avatarFile && (
              <p className="mt-1 text-xs text-accent">New avatar selected</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fog">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-2xl border border-line bg-canvas/80 px-4 py-3 text-fog outline-none transition-all placeholder:text-muted focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
              placeholder="Your display name"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-fog">
              Username
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full rounded-2xl border border-line bg-canvas/80 px-4 py-3 text-fog outline-none transition-all placeholder:text-muted focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
              placeholder="Your username"
            />
          </div>

          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-parrot/10 px-4 py-3 text-sm text-parrot">
              <HiCheckCircle size={16} />
              Profile updated successfully
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
              <HiExclamationTriangle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || uploading}
            className="btn-primary rounded-2xl px-8 py-3 text-sm font-semibold transition-all disabled:opacity-50"
          >
            {uploading
              ? "Uploading avatar..."
              : saving
                ? "Saving..."
                : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SettingsPage;
