"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiRequest from "@/lib/apiRequest";
import ShareButton from "@/components/ShareButton";
import OptionsMenu from "@/components/OptionsMenu";
import useAuthStore from "@/stores/authStore";
import { shareContent } from "@/lib/share";
import {
  HiHeart,
  HiLink,
  HiArrowDownTray,
  HiBookmark,
  HiPencilSquare,
  HiTrash,
  HiFlag,
} from "react-icons/hi2";

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
      text: title ? `Check out this wallpaper: ${title}` : "Check out this wallpaper",
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

  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="relative flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleInteract("like")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all ${
            data.isLiked
              ? "bg-parrot/15 text-parrot"
              : "text-muted hover:bg-panel-hover hover:text-fog"
          }`}
        >
          <HiHeart size={20} className={data.isLiked ? "fill-current" : ""} />
          {data.likeCount}
        </button>
        <ShareButton
          title={title}
          text={
            title
              ? `Check out this wallpaper: ${title}`
              : "Check out this wallpaper"
          }
          url={`/pins/${postId}`}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-panel-hover hover:text-fog disabled:opacity-50"
        />
        <OptionsMenu
          align="left"
          buttonClassName="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-panel-hover hover:text-fog"
          items={[
            {
              label: "Copy link",
              icon: <HiLink size={16} />,
              onClick: handleCopyLink,
            },
            {
              label: "Download",
              icon: <HiArrowDownTray size={16} />,
              onClick: handleDownload,
            },
            {
              label: data.isSaved ? "Unsave" : "Save",
              icon: <HiBookmark size={16} />,
              onClick: () => handleInteract("save"),
            },
            isAdmin && {
              label: "Edit in admin",
              icon: <HiPencilSquare size={16} />,
              onClick: () => router.push("/admin/pins"),
            },
            isAdmin && {
              label: "Delete wallpaper",
              icon: <HiTrash size={16} />,
              danger: true,
              onClick: handleDelete,
            },
            !isAdmin && {
              label: "Report",
              icon: <HiFlag size={16} />,
              onClick: () => showToast("Thanks — report noted"),
            },
          ]}
        />
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

      {toast && (
        <div className="absolute -bottom-10 left-0 rounded-full border border-line bg-panel px-3 py-1 text-xs text-fog">
          {toast}
        </div>
      )}
    </div>
  );
}

export default PostInteractions;
