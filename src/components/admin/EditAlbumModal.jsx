"use client";

import { useState } from "react";
import apiRequest from "@/lib/apiRequest";

const inputClass =
  "w-full rounded-xl border border-line bg-canvas/80 px-3 py-2.5 text-sm text-fog outline-none focus:border-accent/50";

function EditAlbumModal({ album, onClose, onSaved }) {
  const isEdit = Boolean(album?._id);
  const [title, setTitle] = useState(album?.title || "");
  const [description, setDescription] = useState(album?.description || "");
  const [isPublic, setIsPublic] = useState(album?.isPublic !== false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        const res = await apiRequest.patch(`/api/admin/albums/${album._id}`, {
          title,
          description,
          isPublic,
        });
        onSaved(res.data.data);
      } else {
        const res = await apiRequest.post("/api/admin/albums", {
          title,
          description,
          isPublic,
        });
        onSaved(res.data.data);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save album");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-[28px] border border-line glass p-6"
      >
        <h3 className="text-lg font-semibold text-fog">
          {isEdit ? "Edit album" : "Create album"}
        </h3>
        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Anime Collection"
            className={inputClass}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this album about?"
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-fog">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded border-line"
          />
          Public album
        </label>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-line py-2.5 text-sm text-muted hover:bg-panel-hover"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create album"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditAlbumModal;
