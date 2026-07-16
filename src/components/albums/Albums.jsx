"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "@/components/Image/Image";
import apiRequest from "@/lib/apiRequest";
import useAuthStore from "@/stores/authStore";
import { HiPlus, HiFolderOpen } from "react-icons/hi2";

function CreateAlbumModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest.post("/api/albums", {
        title,
        description,
      });
      onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create album");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-[28px] border border-line glass p-6"
      >
        <h3 className="text-lg font-semibold text-fog">New album</h3>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Anime Collection"
            className="w-full rounded-2xl border border-line bg-canvas/80 px-4 py-3 text-sm text-fog outline-none focus:border-accent/50"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this album about?"
            rows={3}
            className="w-full resize-none rounded-2xl border border-line bg-canvas/80 px-4 py-3 text-sm text-fog outline-none focus:border-accent/50"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-line py-2.5 text-sm text-muted hover:bg-panel-hover"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create album"}
          </button>
        </div>
      </form>
    </div>
  );
}

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
