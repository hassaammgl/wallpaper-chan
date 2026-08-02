"use client";

import { useState, useEffect } from "react";
import Image from "@/components/Image/Image";
import apiRequest from "@/lib/apiRequest";
import EditPinFormFields from "@/components/admin/EditPinFormFields";

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
  const [albums, setAlbums] = useState([]);
  const [board, setBoard] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const ownerId = pin.user?.id || pin.user;
    if (!ownerId) return;
    apiRequest
      .get(`/api/boards/${ownerId}`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setAlbums(list);
        const matched = list.find((a) => a._id === pin.board);
        setBoard(matched ? matched._id : "");
      })
      .catch(() => {});
  }, [pin._id, pin.board, pin.user]);

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
        board: board || "general",
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

        <EditPinFormFields
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          prompt={prompt}
          setPrompt={setPrompt}
          category={category}
          setCategory={setCategory}
          deviceType={deviceType}
          setDeviceType={setDeviceType}
          board={board}
          setBoard={setBoard}
          albums={albums}
          tags={tags}
          setTags={setTags}
          link={link}
          setLink={setLink}
        />

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

export default EditPinModal;
