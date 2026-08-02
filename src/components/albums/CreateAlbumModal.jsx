"use client";

import { useState } from "react";
import apiRequest from "@/lib/apiRequest";

function CreateAlbumModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest.post("/api/albums", {
        title,
        description,
      });
      onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create album");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-[28px] border border-line glass p-6"
      >
        <h3 className="text-lg font-semibold text-fog">New album</h3>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Anime Collection"
            className="w-full rounded-2xl border border-line bg-canvas/80 px-4 py-3 text-sm text-fog outline-none focus:border-accent/50"
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
            className="w-full resize-none rounded-2xl border border-line bg-canvas/80 px-4 py-3 text-sm text-fog outline-none focus:border-accent/50"
          />
        </div>
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
            disabled={loading}
            className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create album"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateAlbumModal;
