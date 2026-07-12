"use client";

import { useState } from "react";
import apiRequest from "@/lib/apiRequest";
import { HiFaceSmile, HiPaperAirplane } from "react-icons/hi2";

function CommentForm({ id, onAdd }) {
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!desc.trim() || loading) return;

    setLoading(true);
    try {
      const res = await apiRequest.post("/api/comments", {
        description: desc,
        pin: id,
      });
      onAdd(res.data);
      setDesc("");
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 rounded-2xl border border-line bg-panel/60 p-2 focus-within:border-accent/30 focus-within:glow-ring"
    >
      <input
        type="text"
        placeholder="Add a comment..."
        onChange={(e) => setDesc(e.target.value)}
        value={desc}
        className="flex-1 bg-transparent px-2 py-2 text-sm text-fog outline-none placeholder:text-muted"
      />
      <button
        type="submit"
        disabled={!desc.trim() || loading}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent transition-all hover:bg-accent hover:text-white disabled:opacity-30"
      >
        <HiPaperAirplane size={16} />
      </button>
    </form>
  );
}

export default CommentForm;
