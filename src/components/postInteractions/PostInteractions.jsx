"use client";

import { useState, useEffect } from "react";
import apiRequest from "@/lib/apiRequest";
import ShareButton from "@/components/ShareButton";
import { HiEllipsisHorizontal, HiHeart } from "react-icons/hi2";

function PostInteractions({ postId, title }) {
  const [data, setData] = useState({ likeCount: 0, isLiked: false, isSaved: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const res = await apiRequest.get(`/api/pins/interaction-check/${postId}`);
        setData(res.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchInteractions();
  }, [postId]);

  const handleInteract = async (type) => {
    try {
      const res = await apiRequest.post(`/api/pins/interact/${postId}`, { type });
      if (type === "like") {
        setData((prev) => ({
          ...prev,
          isLiked: res.data.liked,
          likeCount: prev.likeCount + (res.data.liked ? 1 : -1),
        }));
      }
      if (type === "save") {
        setData((prev) => ({ ...prev, isSaved: res.data.saved }));
      }
    } catch {
      // ignore
    }
  };

  if (loading) return null;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleInteract("like")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all ${
            data.isLiked
              ? "bg-parrot/15 text-parrot"
              : "text-muted hover:bg-panel-hover hover:text-fog"
          }`}
        >
          <HiHeart
            size={20}
            className={data.isLiked ? "fill-current" : ""}
          />
          {data.likeCount}
        </button>
        <ShareButton
          title={title}
          text={title ? `Check out this wallpaper: ${title}` : "Check out this wallpaper"}
          url={`/pins/${postId}`}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-panel-hover hover:text-fog disabled:opacity-50"
        />
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-panel-hover hover:text-fog"
          aria-label="More options"
        >
          <HiEllipsisHorizontal size={18} />
        </button>
      </div>

      <button
        onClick={() => handleInteract("save")}
        className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 ${
          data.isSaved
            ? "border border-accent/40 bg-accent-soft text-accent"
            : "btn-primary"
        }`}
      >
        {data.isSaved ? "Saved" : "Save"}
      </button>
    </div>
  );
}

export default PostInteractions;
