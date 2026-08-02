"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "@/components/Image/Image";
import apiRequest from "@/lib/apiRequest";
import useAuthStore from "@/stores/authStore";
import CreateAlbumModal from "@/components/albums/CreateAlbumModal";
import { HiPlus, HiFolderOpen } from "react-icons/hi2";

function Albums({ userId, isOwner }) {
  const { currentUser } = useAuthStore();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const canCreate = isOwner && currentUser?.id === userId;

  const fetchAlbums = async () => {
    try {
      const res = await apiRequest.get(`/api/boards/${userId}`);
      setAlbums(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse space-y-3">
            <div className="aspect-[3/4] rounded-[20px] bg-panel" />
            <div className="h-4 w-2/3 rounded bg-panel" />
          </div>
        ))}
      </div>
    );
  }

  if (error) return <p className="text-danger">Failed to load albums</p>;

  return (
    <div className="space-y-5">
      {canCreate && (
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-2xl border border-dashed border-line px-4 py-2.5 text-sm font-medium text-muted transition-all hover:border-accent/40 hover:text-accent"
        >
          <HiPlus size={18} />
          Create album
        </button>
      )}

      {!albums.length ? (
        <div className="flex flex-col items-center gap-3 rounded-[28px] border border-line glass py-16 text-center">
          <HiFolderOpen size={40} className="text-muted" />
          <p className="text-fog font-medium">No albums yet</p>
          <p className="text-sm text-muted">
            {canCreate
              ? "Group your wallpapers into albums with prompts & comments"
              : "This user hasn't created any albums"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {albums.map((album) => (
            <Link
              href={`/albums/${album._id}`}
              key={album._id}
              className="group space-y-3"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] ring-1 ring-line transition-all group-hover:-translate-y-1 group-hover:ring-accent/30 group-hover:shadow-xl group-hover:shadow-accent/10">
                {album.firstPin?.media ? (
                  <Image
                    path={album.firstPin.media}
                    pin={album.firstPin}
                    alt={album.title || "Album cover"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-panel">
                    <HiFolderOpen size={32} className="text-muted" />
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-ink/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                {!album.isPublic && (
                  <span className="absolute top-2 right-2 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-medium text-white">
                    Private
                  </span>
                )}
              </div>
              <div>
                <h3 className="truncate text-sm font-semibold text-fog">
                  {album.title}
                </h3>
                <span className="text-xs text-muted">
                  {album.pinCount} wallpaper{album.pinCount !== 1 ? "s" : ""}
                </span>
                {album.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                    {album.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateAlbumModal
          onClose={() => setShowCreate(false)}
          onCreated={(album) => setAlbums((prev) => [album, ...prev])}
        />
      )}
    </div>
  );
}

export default Albums;
