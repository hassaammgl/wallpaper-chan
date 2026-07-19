"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "@/components/Image/Image";
import apiRequest from "@/lib/apiRequest";
import { format } from "timeago.js";
import {
  HiMagnifyingGlass,
  HiTrash,
  HiNoSymbol,
  HiPencilSquare,
  HiPlus,
} from "react-icons/hi2";

const CATEGORIES = [
  "general",
  "anime",
  "nature",
  "abstract",
  "gaming",
  "minimal",
  "dark",
  "amoled",
  "cars",
  "space",
  "fantasy",
  "cityscape",
];

const inputClass =
  "w-full rounded-xl border border-line bg-canvas/80 px-3 py-2.5 text-sm text-fog outline-none focus:border-accent/50";

function EditPinModal({ pin, onClose, onSaved }) {
  const [title, setTitle] = useState(pin.title || "");
  const [description, setDescription] = useState(pin.description || "");
  const [prompt, setPrompt] = useState(pin.prompt || "");
  const [link, setLink] = useState(pin.link || "");
  const [category, setCategory] = useState(pin.category || "general");
  const [deviceType, setDeviceType] = useState(pin.deviceType || "both");
  const [tags, setTags] = useState(
    Array.isArray(pin.tags) ? pin.tags.join(", ") : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await apiRequest.patch(`/api/admin/pins/${pin._id}`, {
        title,
        description,
        prompt: prompt || null,
        link: link || null,
        category,
        deviceType,
        tags,
      });
      onSaved(res.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update wallpaper");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSave}
        className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-[28px] border border-line glass p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-fog">Edit wallpaper</h3>
            <p className="text-xs text-muted">Update content metadata</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-line px-3 py-1.5 text-xs text-muted hover:bg-panel-hover"
          >
            Close
          </button>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="relative aspect-video overflow-hidden rounded-2xl border border-line">
          <Image
            path={pin.media}
            pin={pin}
            alt={pin.title || "Preview"}
            fill
            className="object-cover"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">AI Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            className={`${inputClass} resize-none font-mono text-xs`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted">Device</label>
            <select
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              className={inputClass}
            >
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Tags</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="comma, separated, tags"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Source link</label>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://..."
            className={inputClass}
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
            disabled={saving}
            className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function PinsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [actionError, setActionError] = useState("");

  const fetchPins = async () => {
    try {
      setLoading(true);
      setActionError("");
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (query) params.set("search", query);
      const res = await apiRequest.get(`/api/admin/pins?${params}`);
      setData(res.data.data);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to load pins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPins();
  }, [page, query]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(search);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this wallpaper permanently?")) return;
    try {
      await apiRequest.delete(`/api/admin/pins/${id}`);
      fetchPins();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to delete pin");
    }
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-fog">Pins</h1>
          <p className="mt-1 text-sm text-muted">
            Edit, delete, and moderate wallpapers
          </p>
        </div>
        <Link
          href="/create"
          className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm"
        >
          <HiPlus size={16} />
          Upload wallpaper
        </Link>
      </div>

      {actionError && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {actionError}
        </div>
      )}

      <form onSubmit={handleSearch} className="flex max-w-md gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-panel/60 px-3">
          <HiMagnifyingGlass size={16} className="text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pins..."
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
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.pins?.map((pin) => (
            <div
              key={pin._id}
              className={`overflow-hidden rounded-[20px] border glass ${
                pin.userBlocked
                  ? "border-danger/50 opacity-60"
                  : "border-line"
              }`}
            >
              <div className="relative aspect-video w-full">
                <Image
                  path={pin.media}
                  pin={pin}
                  alt={pin.title || "Pin preview"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-2 p-4">
                <h3 className="truncate font-semibold text-fog">{pin.title}</h3>
                <p className="truncate text-xs text-muted">
                  @{pin.user?.userName || "unknown"} ·{" "}
                  {pin.resolution || `${pin.width}x${pin.height}`}
                  {pin.createdAt ? ` · ${format(pin.createdAt)}` : ""}
                  {pin.userBlocked && (
                    <span className="ml-2 inline-flex items-center gap-0.5 text-danger">
                      <HiNoSymbol size={10} />
                      Blocked user
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-1">
                  {pin.deviceType && (
                    <span className="rounded-full bg-panel px-2 py-0.5 text-[10px] capitalize text-muted">
                      {pin.deviceType}
                    </span>
                  )}
                  {pin.category && (
                    <span className="rounded-full bg-panel px-2 py-0.5 text-[10px] capitalize text-muted">
                      {pin.category}
                    </span>
                  )}
                  {pin.uploadProvider && (
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] text-accent">
                      {pin.uploadProvider}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`/pins/${pin._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-xl border border-line py-2 text-center text-xs font-medium text-fog hover:bg-panel-hover"
                  >
                    View
                  </a>
                  <button
                    type="button"
                    onClick={() => setEditing(pin)}
                    className="rounded-xl border border-line px-3 py-2 text-fog hover:bg-panel-hover"
                    title="Edit"
                  >
                    <HiPencilSquare size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(pin._id)}
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

      {editing && (
        <EditPinModal
          pin={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setData((prev) =>
              prev
                ? {
                    ...prev,
                    pins: prev.pins.map((p) =>
                      p._id === updated._id ? { ...p, ...updated } : p
                    ),
                  }
                : prev
            );
          }}
        />
      )}
    </div>
  );
}

export default PinsPage;
