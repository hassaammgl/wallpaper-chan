"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "@/components/Image/Image";
import ShareButton from "@/components/ShareButton";
import OptionsMenu from "@/components/OptionsMenu";
import apiRequest from "@/lib/apiRequest";
import useAuthStore from "@/stores/authStore";
import { shareContent } from "@/lib/share";
import {
  HiBookmark,
  HiLink,
  HiArrowTopRightOnSquare,
  HiArrowDownTray,
  HiFlag,
} from "react-icons/hi2";

function GalleryItem({ item }) {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  const requireAuth = () => {
    if (!currentUser) {
      router.push("/auth");
      return false;
    }
    return true;
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!requireAuth()) return;
    try {
      const res = await apiRequest.post(`/api/pins/interact/${item._id}`, {
        type: "save",
      });
      setSaved(!!res.data.saved);
      showToast(res.data.saved ? "Saved" : "Unsaved");
    } catch {
      showToast("Save failed");
    }
  };

  const handleCopyLink = async () => {
    const result = await shareContent({
      title: item.title,
      text: item.title
        ? `Check out this wallpaper: ${item.title}`
        : "Check out this wallpaper",
      url: `/pins/${item._id}`,
    });
    if (result.method === "clipboard" || result.method === "prompt") {
      showToast("Link copied");
    }
  };

  const handleDownload = async () => {
    try {
      const { downloadPin } = await import("@/lib/downloadPin");
      await downloadPin(item._id, `${item.title || "wallpaper"}.jpg`);
    } catch {
      showToast("Download failed");
    }
  };

  const pinHeight = Number(item.height) || 1200;
  const pinWidth = Number(item.width) || 800;
  const rowSpan = Math.max(
    22,
    Math.min(52, Math.ceil((pinHeight / pinWidth) * 28))
  );
  const showChrome = menuOpen;

  return (
    <article
      className={`group relative z-0 transition-all duration-300 hover:z-30 hover:-translate-y-1 ${
        menuOpen ? "z-40" : ""
      }`}
      style={{
        gridRowEnd: `span ${rowSpan}`,
      }}
    >
      <div
        className="relative overflow-hidden rounded-[20px] bg-panel ring-1 ring-line transition-all group-hover:ring-accent/30 group-hover:shadow-2xl group-hover:shadow-accent/10"
        style={{ height: "100%", minHeight: rowSpan * 10 }}
      >
        <Image
          path={item.media}
          pin={item}
          uploadProvider={item.uploadProvider}
          mode="display"
          w={372}
          alt={item.title || "Wallpaper"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        <Link
          href={`/pins/${item._id}`}
          className="absolute inset-0 z-[1]"
          aria-label={item.title || "Open wallpaper"}
        >
          <span
            className={`absolute inset-0 bg-linear-to-t from-ink/90 via-ink/25 to-transparent transition-opacity duration-300 ${
              showChrome ? "opacity-100" : "opacity-80 group-hover:opacity-100"
            }`}
          />
        </Link>

        <button
          type="button"
          className={`absolute top-3 right-3 z-[3] items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-xs font-semibold text-ink shadow-lg backdrop-blur-sm transition-transform hover:scale-105 ${
            showChrome ? "flex" : "hidden group-hover:flex"
          }`}
          onClick={handleSave}
        >
          <HiBookmark size={14} />
          {saved ? "Saved" : "Save"}
        </button>

        {toast && (
          <div className="pointer-events-none absolute top-3 left-3 right-24 z-[4] truncate rounded-full bg-ink/85 px-3 py-1 text-[11px] text-white backdrop-blur-sm">
            {toast}
          </div>
        )}

        {/* Title always visible so the feed never looks empty */}
        {item.title && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[2] p-3 sm:p-4">
            <p className="truncate pr-20 text-sm font-medium text-white drop-shadow-lg">
              {item.title}
            </p>
            <div className="mt-1 flex flex-wrap gap-1 pr-20">
              {item.deviceType && (
                <span className="rounded bg-black/45 px-1.5 py-0.5 text-[10px] capitalize text-white/85">
                  {item.deviceType}
                </span>
              )}
              {item.resolution && (
                <span className="rounded bg-black/45 px-1.5 py-0.5 text-[10px] text-white/85">
                  {item.resolution}
                </span>
              )}
            </div>
          </div>
        )}

        <div
          className={`absolute right-3 bottom-3 z-[3] items-center gap-2 ${
            showChrome ? "flex" : "hidden group-hover:flex"
          }`}
        >
          <ShareButton
            stopPropagation
            title={item.title}
            text={
              item.title
                ? `Check out this wallpaper: ${item.title}`
                : "Check out this wallpaper"
            }
            url={`/pins/${item._id}`}
            iconSize={16}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 disabled:opacity-50"
          />
          <OptionsMenu
            stopPropagation
            align="right"
            placement="top"
            iconSize={16}
            onOpenChange={setMenuOpen}
            buttonClassName="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
            items={[
              {
                label: "Open",
                icon: <HiArrowTopRightOnSquare size={15} />,
                onClick: () => router.push(`/pins/${item._id}`),
              },
              {
                label: "Copy link",
                icon: <HiLink size={15} />,
                onClick: handleCopyLink,
              },
              {
                label: saved ? "Unsave" : "Save",
                icon: <HiBookmark size={15} />,
                onClick: handleSave,
              },
              {
                label: "Download",
                icon: <HiArrowDownTray size={15} />,
                onClick: handleDownload,
              },
              {
                label: "Report",
                icon: <HiFlag size={15} />,
                onClick: () => showToast("Thanks — report noted"),
              },
            ]}
          />
        </div>
      </div>
    </article>
  );
}

export default GalleryItem;
