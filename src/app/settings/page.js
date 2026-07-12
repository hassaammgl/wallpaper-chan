"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "@/components/Image/Image";
import useAuthStore from "@/stores/authStore";
import apiRequest from "@/lib/apiRequest";
import {
  HiUser,
  HiPhoto,
  HiCheckCircle,
  HiExclamationTriangle,
} from "react-icons/hi2";

function SettingsPage() {
  const { currentUser, updateCurrentUser } = useAuthStore();
  const router = useRouter();

  const [displayName, setDisplayName] = useState(
    currentUser?.displayName || ""
  );
  const [userName, setUserName] = useState(currentUser?.userName || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      await apiRequest.patch("/api/user", { displayName, userName });
      updateCurrentUser({ ...currentUser, displayName, userName });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setSaving(false);
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
        <div className="flex items-center gap-5 mb-8">
          <Image
            path={currentUser.img || "/general/noAvatar.png"}
            alt="avatar"
            className="h-20 w-20 rounded-2xl object-cover ring-4 ring-accent/20"
          />
          <div>
            <h2 className="text-xl font-bold text-fog">
              {currentUser.displayName || currentUser.userName}
            </h2>
            <p className="text-sm text-muted">@{currentUser.userName}</p>
            <p className="text-xs text-muted/60 mt-1">{currentUser.email}</p>
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
            disabled={saving}
            className="btn-primary rounded-2xl px-8 py-3 text-sm font-semibold transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SettingsPage;
