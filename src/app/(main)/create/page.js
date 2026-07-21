"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import useAuthStore from "@/stores/authStore";
import useEditStore from "@/stores/editorStore";
import Editor from "@/components/editor/editor";
import Image from "@/components/Image/Image";
import apiRequest from "@/lib/apiRequest";
import { uploadWallpaper } from "@/lib/uploadWallpaper";
import {
  HiPencilSquare,
  HiArrowUpTray,
  HiPhoto,
  HiDevicePhoneMobile,
  HiComputerDesktop,
  HiDocumentDuplicate,
  HiTrash,
  HiClock,
} from "react-icons/hi2";

const inputClass =
  "w-full rounded-2xl border border-line bg-canvas/80 px-4 py-3 text-sm text-fog outline-none transition-all placeholder:text-muted focus:border-accent/50 focus:ring-2 focus:ring-accent/20";

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

const SUGGESTED_TAGS = [
  "4k",
  "hd",
  "mobile",
  "desktop",
  "portrait",
  "landscape",
  "dark",
  "light",
  "minimal",
  "anime",
  "nature",
  "gaming",
  "amoled",
  "abstract",
  "wallpaper",
];

function formatDraftTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CreatePageContent() {
  const { currentUser } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftParam = searchParams.get("draft");
  const { textOptions, canvasOptions } = useEditStore();

  const [file, setFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [uploadProvider, setUploadProvider] = useState("imagekit");
  const [deviceType, setDeviceType] = useState("both");
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTags, setCustomTags] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [link, setLink] = useState("");
  const [category, setCategory] = useState("general");
  const [previewImg, setPreviewImg] = useState({ url: "", width: 0, height: 0 });
  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [draftId, setDraftId] = useState(null);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const autoSaveTimer = useRef(null);
  const hydratedDraft = useRef(false);

  useEffect(() => {
    if (!currentUser) {
      router.push("/auth");
      return;
    }
    if (currentUser.role !== "admin") {
      router.replace("/");
    }
  }, [router, currentUser]);

  useEffect(() => {
    apiRequest
      .get("/api/upload/config")
      .then((res) => setUploadProvider(res.data.data.provider))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;
    apiRequest
      .get(`/api/boards/${currentUser.id}`)
      .then((res) => setAlbums(res.data))
      .catch(() => {});
  }, [currentUser?.id]);

  const loadDrafts = useCallback(async () => {
    try {
      const res = await apiRequest.get("/api/drafts");
      setDrafts(Array.isArray(res.data) ? res.data : []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === "admin") loadDrafts();
  }, [currentUser, loadDrafts]);

  useEffect(() => {
    if (file) {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
      img.onload = () => {
        setPreviewImg({ url: objectUrl, width: img.width, height: img.height });
        // New local file replaces previous media until uploaded again
        setUploadedMedia(null);
      };
    }
  }, [file]);

  const applyDraft = useCallback((draft) => {
    setDraftId(draft._id);
    setTitle(draft.title || "");
    setDescription(draft.description || "");
    setPrompt(draft.prompt || "");
    setLink(draft.link || "");
    setCategory(draft.category || "general");
    setDeviceType(draft.deviceType || "both");
    setSelectedAlbum(
      draft.board && draft.board !== "general" ? draft.board : ""
    );
    setSelectedTags(Array.isArray(draft.tags) ? draft.tags : []);
    setCustomTags("");
    setFile(null);
    setError("");
    setInfo(`Resumed draft: ${draft.title || draft.fileName || "Untitled"}`);

    if (draft.media) {
      const mediaData = {
        provider: draft.uploadProvider || "imagekit",
        filePath: draft.media,
        originalMedia: draft.originalMedia || draft.media,
        originalUrl: draft.originalUrl || null,
        url: draft.originalUrl || null,
        width: draft.width || 0,
        height: draft.height || 0,
        name: draft.fileName || null,
      };
      setUploadedMedia(mediaData);
      setPreviewImg({
        url: draft.originalUrl || draft.media,
        width: draft.width || 800,
        height: draft.height || 0,
      });
    } else {
      setUploadedMedia(null);
      setPreviewImg({ url: "", width: 0, height: 0 });
    }
  }, []);

  useEffect(() => {
    if (!draftParam || hydratedDraft.current || currentUser?.role !== "admin") {
      return;
    }
    hydratedDraft.current = true;
    setLoadingDraft(true);
    apiRequest
      .get(`/api/drafts/${draftParam}`)
      .then((res) => applyDraft(res.data))
      .catch(() => setError("Could not load draft"))
      .finally(() => setLoadingDraft(false));
  }, [draftParam, currentUser, applyDraft]);

  const collectDraftPayload = useCallback(() => {
    const allTags = [
      ...new Set([
        ...selectedTags,
        ...customTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      ]),
    ];

    return {
      id: draftId || undefined,
      title,
      description,
      prompt: prompt || "",
      link: link || "",
      board: selectedAlbum || "general",
      tags: allTags,
      deviceType,
      category,
      media: uploadedMedia?.filePath || null,
      originalMedia: uploadedMedia?.originalMedia || uploadedMedia?.filePath || null,
      originalUrl: uploadedMedia?.originalUrl || uploadedMedia?.url || null,
      uploadProvider: uploadedMedia?.provider || null,
      width: uploadedMedia?.width || previewImg.width || null,
      height: uploadedMedia?.height || previewImg.height || null,
      resolution:
        uploadedMedia?.width && uploadedMedia?.height
          ? `${uploadedMedia.width}x${uploadedMedia.height}`
          : previewImg.width && previewImg.height
            ? `${previewImg.width}x${previewImg.height}`
            : null,
      fileName: file?.name || uploadedMedia?.name || null,
    };
  }, [
    draftId,
    title,
    description,
    prompt,
    link,
    selectedAlbum,
    selectedTags,
    customTags,
    deviceType,
    category,
    uploadedMedia,
    previewImg,
    file,
  ]);

  const saveDraft = useCallback(
    async ({ silent = false } = {}) => {
      const payload = collectDraftPayload();
      if (!payload.media && !payload.title && !payload.description && !file) {
        if (!silent) setError("Add an image or some details before saving a draft");
        return null;
      }

      if (!silent) setSavingDraft(true);
      try {
        const res = await apiRequest.post("/api/drafts", payload);
        setDraftId(res.data._id);
        await loadDrafts();
        if (!silent) setInfo("Draft saved — you can leave and resume anytime");
        return res.data;
      } catch (err) {
        if (!silent) {
          setError(err.response?.data?.message || "Failed to save draft");
        }
        return null;
      } finally {
        if (!silent) setSavingDraft(false);
      }
    },
    [collectDraftPayload, file, loadDrafts]
  );

  // Auto-save draft shortly after useful changes (keeps CDN upload + form)
  useEffect(() => {
    if (currentUser?.role !== "admin") return;
    if (!uploadedMedia?.filePath && !title && !description) return;

    if (autoSaveTimer.current) window.clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = window.setTimeout(() => {
      saveDraft({ silent: true });
    }, 1200);

    return () => {
      if (autoSaveTimer.current) window.clearTimeout(autoSaveTimer.current);
    };
  }, [
    currentUser,
    uploadedMedia,
    title,
    description,
    prompt,
    link,
    selectedTags,
    customTags,
    deviceType,
    category,
    selectedAlbum,
    saveDraft,
  ]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const resetForm = () => {
    setDraftId(null);
    setFile(null);
    setUploadedMedia(null);
    setPreviewImg({ url: "", width: 0, height: 0 });
    setTitle("");
    setDescription("");
    setPrompt("");
    setLink("");
    setCategory("general");
    setDeviceType("both");
    setSelectedTags([]);
    setCustomTags("");
    setSelectedAlbum("");
    setError("");
    setInfo("");
    router.replace("/create");
  };

  const handleDeleteDraft = async (id) => {
    if (!confirm("Delete this draft?")) return;
    try {
      await apiRequest.delete(`/api/drafts/${id}`);
      if (draftId === id) resetForm();
      await loadDrafts();
    } catch {
      setError("Failed to delete draft");
    }
  };

  const handleSubmit = async () => {
    if (isEditing) {
      setIsEditing(false);
      return;
    }

    if (!file && !uploadedMedia) {
      setError("Please select an image first");
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError("Title and description are required");
      return;
    }

    setError("");
    setInfo("");
    setUploading(true);
    setUploadProgress(0);

    try {
      let mediaData = uploadedMedia;
      if (!mediaData) {
        mediaData = await uploadWallpaper(file, {
          onProgress: setUploadProgress,
        });
        setUploadedMedia(mediaData);
        // Persist draft with CDN media so a later publish failure doesn't lose the upload
        await apiRequest.post("/api/drafts", {
          ...collectDraftPayload(),
          media: mediaData.filePath,
          originalMedia: mediaData.originalMedia,
          originalUrl: mediaData.originalUrl,
          uploadProvider: mediaData.provider,
          width: mediaData.width,
          height: mediaData.height,
          resolution: `${mediaData.width}x${mediaData.height}`,
          fileName: file?.name || mediaData.name,
        });
      }

      const allTags = [
        ...new Set([
          ...selectedTags,
          ...customTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        ]),
      ];

      const res = await apiRequest.post("/api/pins", {
        title: title.trim(),
        description: description.trim(),
        prompt: prompt || null,
        link: link || null,
        board: selectedAlbum || null,
        tags: allTags.join(","),
        media: mediaData.filePath,
        originalMedia: mediaData.originalMedia,
        originalUrl: mediaData.originalUrl,
        uploadProvider: mediaData.provider,
        width: mediaData.width,
        height: mediaData.height,
        resolution: `${mediaData.width}x${mediaData.height}`,
        deviceType,
        category: category || "general",
        textOptions: JSON.stringify(textOptions),
        canvasOptions: JSON.stringify(canvasOptions),
      });

      if (draftId) {
        await apiRequest.delete(`/api/drafts/${draftId}`).catch(() => {});
      }

      router.push(`/pins/${res.data._id}`);
    } catch (err) {
      // Keep uploadedMedia so the same wallpaper doesn't need re-upload
      setError(err.response?.data?.message || err.message || "Upload failed");
      await saveDraft({ silent: true });
      setInfo("Progress saved as draft — fix the issue and publish again");
    } finally {
      setUploading(false);
    }
  };

  if (!currentUser || currentUser.role !== "admin") return null;

  if (loadingDraft) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl animate-fade-up">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-fog">
            {isEditing ? "Design your wallpaper" : "Upload wallpaper"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Drafts save your image + details so you don’t rewrite the same
            wallpaper. Via{" "}
            {uploadProvider === "cloudinary" ? "Cloudinary" : "ImageKit"}.
          </p>
          {draftId && (
            <p className="mt-1 text-xs text-accent">Editing draft · auto-saving</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => saveDraft()}
            disabled={savingDraft || uploading}
            className="rounded-full border border-line px-4 py-2.5 text-sm font-medium text-fog transition-colors hover:bg-panel-hover disabled:opacity-50"
          >
            {savingDraft ? "Saving…" : "Save draft"}
          </button>
          {(file || uploadedMedia) && (
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60"
            >
              {uploading
                ? `Uploading ${uploadProgress}%`
                : isEditing
                  ? "Done"
                  : "Publish"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}
      {info && !error && (
        <div className="mb-4 rounded-xl border border-accent/30 bg-accent-soft/40 px-4 py-3 text-sm text-accent">
          {info}
        </div>
      )}

      {uploading && (
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-linear-to-r from-parrot-deep to-parrot transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {drafts.length > 0 && !isEditing && (
        <div className="mb-6 rounded-[24px] border border-line glass p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-accent">
            <HiDocumentDuplicate size={14} />
            Saved drafts ({drafts.length})
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {drafts.map((draft) => (
              <div
                key={draft._id}
                className={`flex items-center gap-3 rounded-2xl border p-2.5 transition-colors ${
                  draftId === draft._id
                    ? "border-accent bg-accent-soft/40"
                    : "border-line hover:border-accent/30"
                }`}
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-canvas">
                  {draft.media ? (
                    <Image
                      path={draft.media}
                      pin={draft}
                      uploadProvider={draft.uploadProvider}
                      alt={draft.title || "Draft"}
                      w={56}
                      h={56}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted">
                      <HiPhoto size={18} />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => {
                    applyDraft(draft);
                    router.replace(`/create?draft=${draft._id}`);
                  }}
                >
                  <p className="truncate text-sm font-medium text-fog">
                    {draft.title || draft.fileName || "Untitled draft"}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
                    <HiClock size={11} />
                    {formatDraftTime(draft.updatedAt)}
                    {draft.media ? " · image ready" : ""}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteDraft(draft._id)}
                  className="rounded-xl border border-danger/30 p-2 text-danger hover:bg-danger/10"
                  title="Delete draft"
                >
                  <HiTrash size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isEditing ? (
        <Editor previewImg={previewImg} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[28px] border border-line glass p-5">
            {previewImg.url ? (
              <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-canvas">
                <Image
                  src={previewImg.url}
                  path={!file && uploadedMedia ? uploadedMedia.filePath : undefined}
                  pin={
                    !file && uploadedMedia
                      ? {
                          media: uploadedMedia.filePath,
                          uploadProvider: uploadedMedia.provider,
                          width: uploadedMedia.width,
                          height: uploadedMedia.height,
                        }
                      : undefined
                  }
                  uploadProvider={uploadedMedia?.provider}
                  alt="Preview"
                  w={previewImg.width || 800}
                  h={previewImg.height}
                  className="max-h-[420px] w-full object-contain"
                />
                {previewImg.width > 0 && (
                  <span className="mt-2 font-mono text-xs text-muted">
                    {previewImg.width}x{previewImg.height} · Full HD original
                    preserved
                  </span>
                )}
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-line glass text-fog transition-all hover:glow-ring"
                >
                  <HiPencilSquare size={16} />
                </button>
                {uploadedMedia && (
                  <span className="absolute bottom-3 left-3 rounded-full bg-parrot/20 px-3 py-1 text-xs font-medium text-parrot">
                    Uploaded ({uploadedMedia.provider}) — kept in draft
                  </span>
                )}
                <label
                  htmlFor="file-replace"
                  className="absolute bottom-3 right-3 cursor-pointer rounded-full border border-line bg-panel/80 px-3 py-1 text-xs text-muted hover:text-fog"
                >
                  Replace image
                  <input
                    className="hidden"
                    id="file-replace"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            ) : (
              <label
                htmlFor="file"
                className="flex h-[420px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-line bg-canvas/50 transition-all hover:border-accent/40 hover:bg-accent-soft/30"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                  <HiArrowUpTray size={28} />
                </div>
                <div className="text-center">
                  <p className="font-medium text-fog">
                    Drop your wallpaper here
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Original quality — drafts keep the upload if publish fails
                  </p>
                </div>
                <input
                  className="hidden"
                  id="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  type="file"
                  accept="image/*"
                />
              </label>
            )}
          </div>

          <form
            className="space-y-4 rounded-[28px] border border-line glass p-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-accent">
              <HiPhoto size={14} />
              Wallpaper details
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted">
                Device type *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    value: "mobile",
                    label: "Mobile",
                    icon: HiDevicePhoneMobile,
                  },
                  {
                    value: "desktop",
                    label: "Desktop",
                    icon: HiComputerDesktop,
                  },
                  { value: "both", label: "Both", icon: HiPhoto },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDeviceType(value)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-medium transition-all ${
                      deviceType === value
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-line text-muted hover:border-accent/30"
                    }`}
                  >
                    <Icon size={20} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="title" className="text-xs font-medium text-muted">
                Title *
              </label>
              <input
                type="text"
                placeholder="Give it a title"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="description"
                className="text-xs font-medium text-muted"
              >
                Description *
              </label>
              <textarea
                placeholder="Describe your wallpaper"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                required
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="prompt" className="text-xs font-medium text-muted">
                AI Prompt
              </label>
              <textarea
                placeholder="Paste the prompt used to generate this wallpaper (optional)"
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows="2"
                className={`${inputClass} resize-none font-mono text-xs`}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="category"
                className="text-xs font-medium text-muted"
              >
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted">
                Quick tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      selectedTags.includes(tag)
                        ? "bg-accent-soft text-accent"
                        : "border border-line text-muted hover:border-accent/30"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tags" className="text-xs font-medium text-muted">
                Custom tags
              </label>
              <input
                type="text"
                placeholder="Add more tags, comma separated"
                id="tags"
                value={customTags}
                onChange={(e) => setCustomTags(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="album" className="text-xs font-medium text-muted">
                Album
              </label>
              <select
                id="album"
                value={selectedAlbum}
                onChange={(e) => setSelectedAlbum(e.target.value)}
                className={inputClass}
              >
                <option value="">No album (uncategorized)</option>
                {albums.map((album) => (
                  <option key={album._id} value={album._id}>
                    {album.title}
                  </option>
                ))}
              </select>
              {albums.length === 0 && currentUser?.userName && (
                <p className="text-xs text-muted">
                  No albums yet.{" "}
                  <Link
                    href={`/${currentUser.userName}?tab=albums`}
                    className="text-accent hover:underline"
                  >
                    Create one on your profile
                  </Link>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="link" className="text-xs font-medium text-muted">
                Source link
              </label>
              <input
                type="text"
                placeholder="https://..."
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => saveDraft()}
                disabled={savingDraft || uploading}
                className="flex-1 rounded-2xl border border-line py-3 text-sm font-medium text-fog hover:bg-panel-hover disabled:opacity-50"
              >
                {savingDraft ? "Saving…" : "Save draft"}
              </button>
              <button
                type="submit"
                disabled={uploading || (!file && !uploadedMedia)}
                className="btn-primary flex-[1.4] py-3 text-sm disabled:opacity-50"
              >
                {uploading
                  ? `Uploading… ${uploadProgress}%`
                  : "Publish wallpaper"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
        </div>
      }
    >
      <CreatePageContent />
    </Suspense>
  );
}

export default CreatePage;
