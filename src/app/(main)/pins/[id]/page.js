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
  HiArrowsPointingOut,
  HiXMark,
} from "react-icons/hi2";

function PinPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchPin = async () => {
      try {
        const res = await apiRequest.get(`/api/pins/${id}`);
        if (cancelled) return;
        setData(res.data);
        apiRequest.post("/api/history", { pinId: id }).catch(() => {});
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message || err.message || "Failed to load pin"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPin();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

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
      width: 900,
      originalUrl: data.originalUrl,
      originalMedia: data.originalMedia,
    }) ||
    data.originalUrl ||
    "";

  const fullscreenSrc =
    resolveMediaSrc(data.media, {
      provider: data.uploadProvider || "imagekit",
      mode: "display",
      width: 1920,
      originalUrl: data.originalUrl,
      originalMedia: data.originalMedia,
    }) ||
    data.originalUrl ||
    previewSrc;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 rounded-full border border-line bg-panel/70 px-3.5 py-2 text-sm text-muted hover:text-fog"
      >
        <HiArrowLeft size={16} />
        Back
      </button>

      <div className="overflow-hidden rounded-2xl border border-line bg-panel/40 lg:grid lg:grid-cols-[minmax(0,1fr)_300px]">
        <div
          className="group relative flex cursor-zoom-in items-center justify-center overflow-hidden bg-canvas"
          style={{ height: "min(52vh, 480px)", maxHeight: 480 }}
          onClick={() => previewSrc && setFullscreen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (previewSrc) setFullscreen(true);
            }
          }}
          aria-label="Open full screen preview"
        >
          {previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewSrc}
              alt={data.title || "Wallpaper"}
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                display: "block",
              }}
              loading="eager"
            />
          ) : (
            <p className="text-sm text-muted">No preview</p>
          )}
          {previewSrc && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFullscreen(true);
              }}
              className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-ink/70 px-3 py-1.5 text-xs font-medium text-white opacity-100 backdrop-blur-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
            >
              <HiArrowsPointingOut size={14} />
              Full screen
            </button>
          )}
        </div>

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
      </div>

      {fullscreen && fullscreenSrc && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setFullscreen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Full screen wallpaper preview"
        >
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 z-[101] flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close full screen"
          >
            <HiXMark size={22} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fullscreenSrc}
            alt={data.title || "Wallpaper"}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxHeight: "92vh",
              maxWidth: "96vw",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              borderRadius: 12,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default PinPage;
