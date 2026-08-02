"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import apiRequest from "@/lib/apiRequest";
import { resolveMediaSrc } from "@/lib/mediaUrls";
import PinDetails from "@/components/pins/PinDetails";
import PinFullscreen from "@/components/pins/PinFullscreen";
import PinPreview from "@/components/pins/PinPreview";
import { HiArrowLeft } from "react-icons/hi2";

function PinPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
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
            err.response?.data?.message || err.message || "Failed to load pin",
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

  const mediaOpts = {
    provider: data.uploadProvider || "imagekit",
    originalUrl: data.originalUrl,
    originalMedia: data.originalMedia,
  };
  const previewSrc =
    resolveMediaSrc(data.media, { ...mediaOpts, mode: "display", width: 900 }) ||
    data.originalUrl ||
    "";
  const fullscreenSrc =
    resolveMediaSrc(data.media, {
      ...mediaOpts,
      mode: "display",
      width: 1920,
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
        <PinPreview
          src={previewSrc}
          title={data.title}
          onOpenFullscreen={() => setFullscreen(true)}
        />
        <PinDetails pinId={id} data={data} />
      </div>

      {fullscreen && (
        <PinFullscreen
          src={fullscreenSrc}
          title={data.title}
          onClose={() => setFullscreen(false)}
        />
      )}
    </div>
  );
}

export default PinPage;
