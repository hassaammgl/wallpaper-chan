"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "@/components/Image/Image";
import Gallery from "@/components/gallery/gallery";
import Comments from "@/components/comments/Comments";
import apiRequest from "@/lib/apiRequest";
import {
  HiArrowLeft,
  HiSparkles,
  HiSquares2X2,
  HiQueueList,
  HiChatBubbleLeftRight,
} from "react-icons/hi2";

function AlbumFeedItem({ pin }) {
  return (
    <Link
      href={`/pins/${pin._id}`}
      className="block overflow-hidden rounded-[24px] border border-line bg-panel/40 transition-all hover:border-accent/30 hover:bg-panel-hover"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-canvas">
        <Image
          path={pin.media}
          pin={pin}
          alt={pin.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-fog">{pin.title}</h3>
            {pin.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted">
                {pin.description}
              </p>
            )}
          </div>
          {pin.user && (
            <div className="flex shrink-0 items-center gap-2">
              <Image
                path={pin.user.img || "/general/noAvatar.svg"}
                alt={pin.user.displayName}
                w={32}
                h={32}
                className="h-8 w-8 rounded-lg object-cover"
              />
            </div>
          )}
        </div>

        {pin.prompt && (
          <div className="rounded-xl border border-line bg-canvas/80 p-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-accent">
              <HiSparkles size={12} />
              AI Prompt
            </div>
            <p className="line-clamp-3 font-mono text-xs leading-relaxed text-muted">
              {pin.prompt}
            </p>
          </div>
        )}

        {pin.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {pin.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

function AlbumPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [view, setView] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const res = await apiRequest.get(`/api/albums/${id}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-danger py-12">{error}</p>;
  }

  if (!data) {
    return <p className="text-center text-muted py-12">Album not found</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-up">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 rounded-full border border-line bg-panel/60 px-4 py-2 text-sm text-muted transition-all hover:border-accent/30 hover:text-fog"
      >
        <HiArrowLeft size={16} />
        Back
      </button>

      <div className="overflow-hidden rounded-[28px] border border-line glass p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-fog">{data.title}</h1>
              {!data.isPublic && (
                <span className="rounded-full bg-panel px-2.5 py-0.5 text-xs text-muted">
                  Private
                </span>
              )}
            </div>
            {data.description && (
              <p className="max-w-xl text-muted leading-relaxed">
                {data.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted">
              <span>{data.pinCount} wallpapers</span>
              <span>{data.commentCount} comments</span>
            </div>
            {data.owner && (
              <Link
                href={`/${data.owner.userName}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-line bg-panel/50 px-3 py-2 transition-colors hover:bg-panel-hover"
              >
                <Image
                  path={data.owner.img || "/general/noAvatar.svg"}
                  alt={data.owner.displayName}
                  w={32}
                  h={32}
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <span className="text-sm font-medium text-fog">
                  {data.owner.displayName}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-1 rounded-2xl border border-line bg-panel/50 p-1 w-fit">
        {[
          { key: "grid", label: "Grid", icon: HiSquares2X2 },
          { key: "feed", label: "Feed", icon: HiQueueList },
          { key: "comments", label: "Comments", icon: HiChatBubbleLeftRight },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
              view === key
                ? "bg-accent-soft text-accent shadow-sm"
                : "text-muted hover:text-fog"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {view === "grid" && (
        data.pinCount > 0 ? (
          <Gallery boardId={id} userId={data.user} />
        ) : (
          <div className="rounded-[28px] border border-line glass py-16 text-center">
            <p className="text-muted">This album is empty</p>
            <p className="mt-1 text-sm text-muted">
              Publish wallpapers to this album from the create page
            </p>
          </div>
        )
      )}

      {view === "feed" && (
        <div className="space-y-5">
          {data.pins?.length > 0 ? (
            data.pins.map((pin) => <AlbumFeedItem key={pin._id} pin={pin} />)
          ) : (
            <div className="rounded-[28px] border border-line glass py-16 text-center">
              <p className="text-muted">No posts in this album yet</p>
            </div>
          )}
        </div>
      )}

      {view === "comments" && (
        <div className="rounded-[28px] border border-line glass p-6">
          <Comments albumId={id} />
        </div>
      )}
    </div>
  );
}

export default AlbumPage;
