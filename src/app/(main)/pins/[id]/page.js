"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "@/components/Image/Image";
import PostInteractions from "@/components/postInteractions/PostInteractions";
import Comments from "@/components/comments/Comments";
import apiRequest from "@/lib/apiRequest";
import { HiArrowLeft, HiArrowDownTray, HiDevicePhoneMobile, HiComputerDesktop, HiSparkles, HiRectangleStack } from "react-icons/hi2";

function PinPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPin = async () => {
      try {
        const res = await apiRequest.get(`/api/pins/${id}`);
        setData(res.data);
        apiRequest.post("/api/history", { pinId: id }).catch(() => {});
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPin();
  }, [id]);

  const handleDownload = async () => {
    try {
      const res = await apiRequest.get(`/api/pins/${id}/download`);
      const { downloadUrl, filename } = res.data;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename || "wallpaper.jpg";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert("Download failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  if (error) return <p className="text-center text-danger py-12">Error: {error}</p>;
  if (!data) return <p className="text-center text-muted py-12">Pin not found</p>;

  const DeviceIcon = data.deviceType === "mobile" ? HiDevicePhoneMobile : HiComputerDesktop;

  return (
    <div className="animate-fade-up">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 rounded-full border border-line bg-panel/60 px-4 py-2 text-sm text-muted transition-all hover:border-accent/30 hover:text-fog"
      >
        <HiArrowLeft size={16} />
        Back
      </button>

      <div className="flex flex-col overflow-hidden rounded-[28px] border border-line glass lg:flex-row lg:max-h-[calc(100vh-180px)]">
        <div className="relative flex flex-1 items-center justify-center bg-canvas/80 p-4 lg:min-h-[400px]">
          <Image
            pin={data}
            path={data.media}
            uploadProvider={data.uploadProvider}
            mode="display"
            alt={data.title || ""}
            w={data.width || 1200}
            h={data.height}
            className="max-h-[70vh] max-w-full rounded-2xl object-contain shadow-2xl shadow-black/40 lg:max-h-full"
          />
        </div>

        <div className="flex w-full flex-col gap-5 border-t border-line p-5 lg:w-[400px] lg:shrink-0 lg:border-t-0 lg:border-l">
          <PostInteractions postId={id} />

          <button
            onClick={handleDownload}
            className="btn-primary flex w-full items-center justify-center gap-2 py-3 text-sm"
          >
            <HiArrowDownTray size={18} />
            Download Full HD ({data.resolution || `${data.width}x${data.height}`})
          </button>

          <div className="flex flex-wrap gap-2 text-xs">
            {data.deviceType && (
              <span className="flex items-center gap-1 rounded-full border border-line bg-panel/60 px-3 py-1 text-muted">
                <DeviceIcon size={14} />
                {data.deviceType}
              </span>
            )}
            {data.category && (
              <span className="rounded-full border border-line bg-panel/60 px-3 py-1 capitalize text-muted">
                {data.category}
              </span>
            )}
            {data.uploadProvider && (
              <span className="rounded-full border border-line bg-panel/60 px-3 py-1 text-muted">
                {data.uploadProvider}
              </span>
            )}
          </div>

          {data?.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {data.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/search?search=${tag}`}
                  className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs text-accent hover:opacity-80"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {data?.album && (
            <Link
              href={`/albums/${data.album._id}`}
              className="flex items-center gap-2 rounded-2xl border border-line bg-panel/50 px-3 py-2 text-sm text-muted transition-colors hover:border-accent/30 hover:text-fog"
            >
              <HiRectangleStack size={16} className="text-accent" />
              {data.album.title}
            </Link>
          )}

          {data?.user ? (
            <Link
              href={`/${data.user.userName}`}
              className="flex items-center gap-3 rounded-2xl border border-line bg-panel/50 p-3 transition-colors hover:bg-panel-hover"
            >
              <Image
                path={data.user.img || "/general/noAvatar.svg"}
                alt={data.user.displayName || data.user.userName || "User avatar"}
                w={40}
                h={40}
                className="h-10 w-10 rounded-xl object-cover ring-2 ring-accent/15"
              />
              <div>
                <span className="block text-sm font-semibold text-fog">
                  {data.user.displayName}
                </span>
                <span className="text-xs text-muted">
                  @{data.user.userName}
                </span>
              </div>
            </Link>
          ) : null}

          {(data.title || data.description) && (
            <div className="space-y-1">
              {data.title && <h2 className="text-lg font-semibold text-fog">{data.title}</h2>}
              {data.description && <p className="text-sm text-muted leading-relaxed">{data.description}</p>}
            </div>
          )}

          {data.prompt && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-accent">
                <HiSparkles size={12} />
                AI Prompt
              </div>
              <div className="rounded-xl border border-line bg-canvas/80 p-3">
                <p className="font-mono text-xs leading-relaxed text-muted whitespace-pre-wrap">{data.prompt}</p>
              </div>
            </div>
          )}

          <Comments pinId={data._id} />
        </div>
      </div>
    </div>
  );
}

export default PinPage;
