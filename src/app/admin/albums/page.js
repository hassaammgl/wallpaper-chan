"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "@/components/Image/Image";
import apiRequest from "@/lib/apiRequest";
import { format } from "timeago.js";
import {
  HiMagnifyingGlass,
  HiPlus,
  HiPencilSquare,
  HiTrash,
  HiEye,
  HiEyeSlash,
  HiRectangleStack,
} from "react-icons/hi2";

const inputClass =
  "w-full rounded-xl border border-line bg-canvas/80 px-3 py-2.5 text-sm text-fog outline-none focus:border-accent/50";

function AlbumFormModal({ album, onClose, onSaved }) {
  const isEdit = Boolean(album?._id);
  const [title, setTitle] = useState(album?.title || "");
  const [description, setDescription] = useState(album?.description || "");
  const [isPublic, setIsPublic] = useState(album?.isPublic !== false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        const res = await apiRequest.patch(`/api/admin/albums/${album._id}`, {
          title,
          description,
          isPublic,
        });
        onSaved(res.data.data);
      } else {
        const res = await apiRequest.post("/api/admin/albums", {
          title,
          description,
          isPublic,
        });
        onSaved(res.data.data);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save album");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-[28px] border border-line glass p-6"
      >
        <h3 className="text-lg font-semibold text-fog">
          {isEdit ? "Edit album" : "Create album"}
        </h3>
        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Anime Collection"
            className={inputClass}
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
            className={`${inputClass} resize-none`}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-fog">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded border-line"
          />
          Public album
        </label>

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
            disabled={saving}
            className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create album"}
          </button>
        </div>
      </form>
    </div>
  );
}

function AlbumsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // null | 'create' | album object

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (query) params.set("search", query);
      const res = await apiRequest.get(`/api/admin/albums?${params}`);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load albums");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, [page, query]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(search);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Delete this album? Wallpapers in it will become uncategorized."
      )
    ) {
      return;
    }
    try {
      await apiRequest.delete(`/api/admin/albums/${id}`);
      fetchAlbums();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete album");
    }
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-fog">Albums</h1>
          <p className="mt-1 text-sm text-muted">
            Create and manage wallpaper albums
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal("create")}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm"
        >
          <HiPlus size={16} />
          Create album
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSearch} className="flex max-w-md gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-panel/60 px-3">
          <HiMagnifyingGlass size={16} className="text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search albums..."
            className="flex-1 bg-transparent py-2.5 text-sm text-fog outline-none placeholder:text-muted"
          />
        </div>
        <button type="submit" className="btn-primary px-4 py-2 text-sm">
          Search
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
        </div>
      ) : !data?.albums?.length ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] border border-line glass py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-panel text-muted">
            <HiRectangleStack size={24} />
          </div>
          <p className="font-medium text-fog">No albums yet</p>
          <p className="max-w-sm text-sm text-muted">
            Create an album to group wallpapers when you publish.
          </p>
          <button
            type="button"
            onClick={() => setModal("create")}
            className="btn-primary mt-2 px-4 py-2 text-sm"
          >
            Create album
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.albums.map((album) => (
            <div
              key={album._id}
              className="overflow-hidden rounded-[20px] border border-line glass"
            >
              <div className="relative aspect-video w-full bg-canvas">
                {album.firstPin?.media ? (
                  <Image
                    path={album.firstPin.media}
                    pin={album.firstPin}
                    alt={album.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted">
                    <HiRectangleStack size={28} />
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate font-semibold text-fog">
                    {album.title}
                  </h3>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-panel px-2 py-0.5 text-[10px] text-muted">
                    {album.isPublic ? (
                      <>
                        <HiEye size={10} /> Public
                      </>
                    ) : (
                      <>
                        <HiEyeSlash size={10} /> Private
                      </>
                    )}
                  </span>
                </div>
                {album.description && (
                  <p className="line-clamp-2 text-xs text-muted">
                    {album.description}
                  </p>
                )}
                <p className="text-xs text-muted">
                  {album.pinCount} wallpaper{album.pinCount !== 1 ? "s" : ""}
                  {album.user?.userName ? ` · @${album.user.userName}` : ""}
                  {album.createdAt ? ` · ${format(album.createdAt)}` : ""}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href={`/albums/${album._id}`}
                    target="_blank"
                    className="flex-1 rounded-xl border border-line py-2 text-center text-xs font-medium text-fog hover:bg-panel-hover"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => setModal(album)}
                    className="rounded-xl border border-line px-3 py-2 text-fog hover:bg-panel-hover"
                    title="Edit"
                  >
                    <HiPencilSquare size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(album._id)}
                    className="rounded-xl border border-danger/30 px-3 py-2 text-danger hover:bg-danger/10"
                    title="Delete"
                  >
                    <HiTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-xl border border-line px-4 py-2 text-sm text-muted disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-muted">
            Page {page} of {data.pages}
          </span>
          <button
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl border border-line px-4 py-2 text-sm text-muted disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {modal && (
        <AlbumFormModal
          album={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => fetchAlbums()}
        />
      )}
    </div>
  );
}

export default AlbumsPage;
