"use client";

import { useRef } from "react";
import Image from "@/components/Image/Image";
import {
  HiCheckCircle,
  HiExclamationTriangle,
  HiCamera,
} from "react-icons/hi2";

export default function SettingsForm({
  user,
  displayName,
  setDisplayName,
  userName,
  setUserName,
  avatarPreview,
  avatarFile,
  onAvatarSelect,
  onSubmit,
  saving,
  uploading,
  success,
  error,
}) {
  const fileInputRef = useRef();

  return (
    <div className="rounded-[28px] border border-line glass p-8">
      <div className="mb-8 flex items-center gap-5">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group relative shrink-0"
        >
          {avatarPreview ? (
            <Image
              src={avatarPreview}
              alt="avatar preview"
              w={80}
              h={80}
              className="h-20 w-20 rounded-2xl object-cover ring-4 ring-accent/20"
            />
          ) : (
            <Image
              path={user.img || "/general/noAvatar.svg"}
              alt="avatar"
              w={80}
              h={80}
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
            onChange={onAvatarSelect}
            className="hidden"
          />
        </button>
        <div>
          <h2 className="text-xl font-bold text-fog">
            {user.displayName || user.userName}
          </h2>
          <p className="text-sm text-muted">@{user.userName}</p>
          <p className="mt-1 text-xs text-muted/60">{user.email}</p>
          {avatarFile && (
            <p className="mt-1 text-xs text-accent">New avatar selected</p>
          )}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
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
  );
}
