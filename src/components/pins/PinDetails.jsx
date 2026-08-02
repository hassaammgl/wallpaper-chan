"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "@/components/Image/Image";
import PostInteractions from "@/components/postInteractions/PostInteractions";
import Comments from "@/components/comments/Comments";
import {
  HiArrowDownTray,
  HiDevicePhoneMobile,
  HiComputerDesktop,
  HiSparkles,
  HiRectangleStack,
} from "react-icons/hi2";

export default function PinDetails({ pinId, data }) {
  const [downloading, setDownloading] = useState(false);

  const DeviceIcon =
    data.deviceType === "mobile" ? HiDevicePhoneMobile : HiComputerDesktop;
  const resolution =
    data.resolution ||
    (data.width && data.height ? `${data.width}x${data.height}` : null);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const { downloadPin } = await import("@/lib/downloadPin");
      await downloadPin(pinId, `${data?.title || "wallpaper"}.jpg`);
    } catch {
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <aside className="border-t border-line lg:border-t-0 lg:border-l">
      <div className="space-y-4 p-5">
        <div className="space-y-1">
          <h1 className="text-lg font-bold leading-snug text-fog">
            {data.title || "Untitled"}
          </h1>
          {data.description && (
            <p className="text-sm text-muted">{data.description}</p>
          )}
        </div>

        <PostInteractions postId={pinId} title={data.title} />

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="btn-primary flex w-full items-center justify-center gap-2 py-3 text-sm disabled:opacity-60"
        >
          <HiArrowDownTray size={18} />
          {downloading
            ? "Preparing…"
            : `Download${resolution ? ` · ${resolution}` : ""}`}
        </button>

        <div className="flex flex-wrap gap-1.5">
          {data.deviceType && (
            <span className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[11px] capitalize text-muted">
              <DeviceIcon size={12} />
              {data.deviceType}
            </span>
          )}
          {data.category && (
            <span className="rounded-full border border-line px-2.5 py-1 text-[11px] capitalize text-muted">
              {data.category}
            </span>
          )}
          {data?.tags?.map((tag) => (
            <Link
              key={tag}
              href={`/search?search=${encodeURIComponent(tag)}`}
              className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] text-accent"
            >
              #{tag}
            </Link>
          ))}
        </div>

        {data?.album && (
          <Link
            href={`/albums/${data.album._id}`}
            className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm text-muted hover:text-fog"
          >
            <HiRectangleStack size={16} className="text-accent" />
            {data.album.title}
          </Link>
        )}

        {data?.user && (
          <Link
            href={`/${data.user.userName}`}
            className="flex items-center gap-3 rounded-xl border border-line p-3"
          >
            <Image
              path={data.user.img || "/general/noAvatar.svg"}
              alt={data.user.displayName || "avatar"}
              w={36}
              h={36}
              className="h-9 w-9 rounded-lg object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-fog">
                {data.user.displayName}
              </p>
              <p className="text-xs text-muted">@{data.user.userName}</p>
            </div>
          </Link>
        )}

        {data.prompt && (
          <div className="space-y-1.5">
            <p className="flex items-center gap-1 text-xs font-medium text-accent">
              <HiSparkles size={12} /> AI Prompt
            </p>
            <div
              className="overflow-y-auto rounded-xl border border-line bg-canvas/70 p-3"
              style={{ maxHeight: 140 }}
            >
              <p className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-muted">
                {data.prompt}
              </p>
            </div>
          </div>
        )}

        <div className="border-t border-line pt-4">
          <Comments pinId={data._id} />
        </div>
      </div>
    </aside>
  );
}
