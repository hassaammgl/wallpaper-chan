"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "@/components/Image/Image";
import PostInteractions from "@/components/postInteractions/PostInteractions";
import Comments from "@/components/comments/Comments";
import apiRequest from "@/lib/apiRequest";
import { resolveMediaSrc } from "@/lib/mediaUrls";
import {
  HiArrowLeft,
  HiArrowDownTray,
  HiDevicePhoneMobile,
  HiComputerDesktop,
  HiSparkles,
  HiRectangleStack,
} from "react-icons/hi2";

function PinPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPin = async () => {
      try {
        const res = await apiRequest.get(`/api/pins/${id}`);
        setData(res.data);
        apiRequest.post("/api/history", { pinId: id }).catch(() => {});
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Failed to load pin"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPin();
  }, [id]);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const { downloadPin } = await import("@/lib/downloadPin");
      await downloadPin(id, `${data?.title || "wallpaper"}.jpg`);
    } catch {
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-danger/30 bg-danger/10 px-6 py-10 text-center">
        <p className="text-danger">{error}</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="btn-primary mt-4 px-5 py-2 text-sm"
        >
          Back home
        </button>
      </div>
    );
  }

  if (!data) {
    return <p className="py-20 text-center text-muted">Wallpaper not found</p>;
  }

  const DeviceIcon =
    data.deviceType === "mobile" ? HiDevicePhoneMobile : HiComputerDesktop;
  const resolution =
    data.resolution ||
    (data.width && data.height ? `${data.width}x${data.height}` : null);

  const previewSrc =
    resolveMediaSrc(data.media, {
      provider: data.uploadProvider || "imagekit",
      mode: "display",
      width: 1200,
      originalUrl: data.originalUrl,
      originalMedia: data.originalMedia,
    }) || data.originalUrl;

  return (
    <div className="mx-auto max-w-5xl animate-fade-up space-y-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 rounded-full border border-line bg-panel/70 px-3.5 py-2 text-sm text-muted transition-colors hover:border-accent/30 hover:text-fog"
      >
        <HiArrowLeft size={16} />
        Back
      </button>

      <div className="overflow-hidden rounded-2xl border border-line bg-panel/40 lg:grid lg:grid-cols-[1fr_320px]">
        <div className="flex items-center justify-center bg-canvas p-4 sm:p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt={data.title || "Wallpaper"}
            className="h-auto max-h-[min(65vh,640px)] w-auto max-w-full rounded-xl object-contain"
            loading="eager"
          />
        </div>

        <aside className="flex min-h-0 flex-col border-t border-line lg:border-t-0 lg:border-l">
          <div className="space-y-4 border-b border-line p-5">
            <div className="space-y-1.5">
              <h1 className="text-lg font-bold leading-snug text-fog">
                {data.title || "Untitled wallpaper"}
              </h1>
              {data.description && (
                <p className="text-sm leading-relaxed text-muted">
                  {data.description}
                </p>
              )}
            </div>

            <PostInteractions postId={id} title={data.title} />

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
                <span className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas/60 px-2.5 py-1 text-[11px] capitalize text-muted">
                  <DeviceIcon size={12} />
                  {data.deviceType}
                </span>
              )}
              {data.category && (
                <span className="rounded-full border border-line bg-canvas/60 px-2.5 py-1 text-[11px] capitalize text-muted">
                  {data.category}
                </span>
              )}
            </div>

            {data?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {data.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?search=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-accent/20 bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent hover:opacity-80"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
            {data?.album && (
              <Link
                href={`/albums/${data.album._id}`}
                className="flex items-center gap-2 rounded-xl border border-line bg-canvas/50 px-3 py-2.5 text-sm text-muted hover:border-accent/30 hover:text-fog"
              >
                <HiRectangleStack size={16} className="text-accent" />
                <span className="truncate">{data.album.title}</span>
              </Link>
            )}

            {data?.user && (
              <Link
                href={`/${data.user.userName}`}
                className="flex items-center gap-3 rounded-xl border border-line bg-canvas/50 p-3 hover:border-accent/25"
              >
                <Image
                  path={data.user.img || "/general/noAvatar.svg"}
                  alt={
                    data.user.displayName || data.user.userName || "User avatar"
                  }
                  w={40}
                  h={40}
                  className="h-10 w-10 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-fog">
                    {data.user.displayName}
                  </span>
                  <span className="text-xs text-muted">
                    @{data.user.userName}
                  </span>
                </div>
              </Link>
            )}

            {data.prompt && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-accent">
                  <HiSparkles size={12} />
                  AI Prompt
                </div>
                <div className="rounded-xl border border-line bg-canvas/70 p-3">
                  <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted">
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
      </div>
    </div>
  );
}

export default PinPage;
