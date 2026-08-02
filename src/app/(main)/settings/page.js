"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import useAuthStore from "@/stores/authStore";
import apiRequest from "@/lib/apiRequest";
import {
  validateProfileForm,
  resolveAvatarUpload,
} from "@/lib/profileActions";
import { SUCCESS_TOAST_MS } from "@/lib/constants";
import SettingsForm from "@/components/settings/SettingsForm";
import { HiUser } from "react-icons/hi2";

function SettingsPage() {
  const { data: session, isPending } = useSession();
  const { currentUser, updateCurrentUser } = useAuthStore();
  const router = useRouter();

  const user = currentUser || session?.user;

  const [displayName, setDisplayName] = useState("");
  const [userName, setUserName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName || user.name || "");
    setUserName(user.userName || "");
  }, [user]);

  const selectAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    const validated = validateProfileForm({ displayName, userName });
    if (validated.error) {
      setError(validated.error);
      setSaving(false);
      return;
    }

    try {
      setUploading(!!avatarFile);
      const imgPath = await resolveAvatarUpload(avatarFile, user?.img);
      setUploading(false);

      const fields = {
        displayName: validated.displayName,
        userName: validated.userName,
      };
      if (imgPath !== user?.img) fields.img = imgPath;

      const res = await apiRequest.patch("/api/user", fields);
      const updated = res.data.user || { ...user, ...fields };
      updateCurrentUser(updated);
      setDisplayName(updated.displayName || "");
      setUserName(updated.userName || "");
      setAvatarFile(null);
      setAvatarPreview(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), SUCCESS_TOAST_MS);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to update profile",
      );
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  if (!user) {
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

      <SettingsForm
        user={user}
        displayName={displayName}
        setDisplayName={setDisplayName}
        userName={userName}
        setUserName={setUserName}
        avatarPreview={avatarPreview}
        avatarFile={avatarFile}
        onAvatarSelect={selectAvatarFile}
        onSubmit={saveProfile}
        saving={saving}
        uploading={uploading}
        success={success}
        error={error}
      />
    </div>
  );
}

export default SettingsPage;
