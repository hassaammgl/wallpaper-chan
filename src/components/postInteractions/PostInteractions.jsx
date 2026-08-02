"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiRequest from "@/lib/apiRequest";
import useAuthStore from "@/stores/authStore";
import { shareContent } from "@/lib/share";
import PostActionBar from "@/components/postInteractions/PostActionBar";

function PostInteractions({ postId, title }) {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const [data, setData] = useState({
    likeCount: 0,
    isLiked: false,
    isSaved: false,
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const res = await apiRequest.get(
          `/api/pins/interaction-check/${postId}`
        );
        setData(res.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchInteractions();
  }, [postId]);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2000);
  };

  const handleInteract = async (type) => {
    if (!currentUser) {
      router.push("/auth");
      return;
    }
    try {
      const res = await apiRequest.post(`/api/pins/interact/${postId}`, {
        type,
      });
      if (type === "like") {
        setData((prev) => ({
          ...prev,
          isLiked: res.data.liked,
          likeCount: prev.likeCount + (res.data.liked ? 1 : -1),
        }));
      }
      if (type === "save") {
        setData((prev) => ({ ...prev, isSaved: res.data.saved }));
        showToast(res.data.saved ? "Saved" : "Removed from saved");
      }
    } catch {
      // ignore
    }
  };

  const handleCopyLink = async () => {
    const result = await shareContent({
      title,
      text: title
        ? `Check out this wallpaper: ${title}`
        : "Check out this wallpaper",
      url: `/pins/${postId}`,
    });
    if (result.method === "clipboard" || result.method === "prompt") {
      showToast("Link copied");
    }
  };

  const handleDownload = async () => {
    try {
      const { downloadPin } = await import("@/lib/downloadPin");
      await downloadPin(postId, `${title || "wallpaper"}.jpg`);
    } catch {
      showToast("Download failed");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this wallpaper permanently?")) return;
    try {
      await apiRequest.delete(`/api/admin/pins/${postId}`);
      showToast("Deleted");
      router.push("/");
    } catch {
      showToast("Delete failed");
    }
  };

  if (loading) return null;

  return (
    <div className="relative flex flex-col gap-2">
      <PostActionBar
        title={title}
        postId={postId}
        likeCount={data.likeCount}
        isLiked={data.isLiked}
        isSaved={data.isSaved}
        isAdmin={currentUser?.role === "admin"}
        onLike={() => handleInteract("like")}
        onSave={() => handleInteract("save")}
        onCopyLink={handleCopyLink}
        onDownload={handleDownload}
        onEditAdmin={() => router.push("/admin/pins")}
        onDelete={handleDelete}
        onReport={() => showToast("Thanks — report noted")}
      />

      {toast && (
        <div className="rounded-xl border border-line bg-panel/80 px-3 py-1.5 text-xs text-fog">
          {toast}
        </div>
      )}
    </div>
  );
}

export default PostInteractions;
