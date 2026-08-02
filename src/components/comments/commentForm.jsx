"use client";

import { useState } from "react";
import apiRequest from "@/lib/apiRequest";
import { HiPaperAirplane } from "react-icons/hi2";

function CommentForm({ pinId, albumId, onAdd }) {
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!desc.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const body = { description: desc };
      if (pinId) body.pin = pinId;
      if (albumId) body.album = albumId;

      const res = await apiRequest.post("/api/comments", body);
      onAdd(res.data);
      setDesc("");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to post comment"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-full border border-line bg-panel/60 p-1.5 pl-4 transition-all focus-within:border-accent/30 focus-within:glow-ring"
      >
        <input
          type="text"
          placeholder="Add a comment..."
          onChange={(e) => setDesc(e.target.value)}
          value={desc}
          className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-fog outline-none placeholder:text-muted"
          aria-label="Comment"
        />
        <button
          type="submit"
          disabled={!desc.trim() || loading}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-ink transition-all hover:brightness-110 disabled:opacity-30"
        >
          <HiPaperAirplane size={16} />
        </button>
      </form>
      {error && <p className="px-2 text-xs text-danger">{error}</p>}
    </div>
  );
}

export default CommentForm;
