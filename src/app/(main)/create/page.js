"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
} from "react-icons/hi2";

const inputClass =
  "w-full rounded-2xl border border-line bg-canvas/80 px-4 py-3 text-sm text-fog outline-none transition-all placeholder:text-muted focus:border-accent/50 focus:ring-2 focus:ring-accent/20";

const CATEGORIES = [
  "general", "anime", "nature", "abstract", "gaming", "minimal",
  "dark", "amoled", "cars", "space", "fantasy", "cityscape",
];

const SUGGESTED_TAGS = [
  "4k", "hd", "mobile", "desktop", "portrait", "landscape",
  "dark", "light", "minimal", "anime", "nature", "gaming",
  "amoled", "abstract", "wallpaper",
];

function CreatePage() {
  const { currentUser } = useAuthStore();
  const router = useRouter();
  const formRef = useRef();
  const { textOptions, canvasOptions } = useEditStore();

  const [file, setFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [uploadProvider, setUploadProvider] = useState("imagekit");
  const [deviceType, setDeviceType] = useState("both");
  const [selectedTags, setSelectedTags] = useState([]);
  const [previewImg, setPreviewImg] = useState({ url: "", width: 0, height: 0 });
  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState("");

  useEffect(() => {
    if (!currentUser) router.push("/auth");
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

  useEffect(() => {
    if (file) {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
      img.onload = () => {
        setPreviewImg({ url: objectUrl, width: img.width, height: img.height });
        setUploadedMedia(null);
      };
    }
  }, [file]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (isEditing) {
      setIsEditing(false);
      return;
    }

    if (!file) {
      setError("Please select an image first");
      return;
    }

    setError("");
    setUploading(true);
    setUploadProgress(0);

    try {
      let mediaData = uploadedMedia;
      if (!mediaData) {
        mediaData = await uploadWallpaper(file, { onProgress: setUploadProgress });
        setUploadedMedia(mediaData);
      }

      const formData = new FormData(formRef.current);
      const customTags = (formData.get("tags") || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const allTags = [...new Set([...selectedTags, ...customTags])];

      const res = await apiRequest.post("/api/pins", {
        title: formData.get("title"),
        description: formData.get("description"),
        prompt: formData.get("prompt") || null,
        link: formData.get("link") || null,
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
        category: formData.get("category") || "general",
        textOptions: JSON.stringify(textOptions),
        canvasOptions: JSON.stringify(canvasOptions),
      });

      router.push(`/pins/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Upload failed");
      setUploadedMedia(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-fog">
            {isEditing ? "Design your wallpaper" : "Upload wallpaper"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Raw full-quality upload via{" "}
            {uploadProvider === "cloudinary" ? "Cloudinary" : "ImageKit"} — no
            compression
          </p>
        </div>
        {file && (
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

      {error && (
        <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
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

      {isEditing ? (
        <Editor previewImg={previewImg} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[28px] border border-line glass p-5">
            {previewImg.url ? (
              <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-canvas">
                <Image
                  src={previewImg.url}
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
                    Uploaded ({uploadedMedia.provider})
                  </span>
                )}
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
                    Original quality — no downscaling on upload
                  </p>
                </div>
                <input
                  className="hidden"
                  id="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  type="file"
                  accept="image/*"
                />
              </label>
            )}
          </div>

          <form
            className="space-y-4 rounded-[28px] border border-line glass p-6"
            ref={formRef}
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
                  { value: "mobile", label: "Mobile", icon: HiDevicePhoneMobile },
                  { value: "desktop", label: "Desktop", icon: HiComputerDesktop },
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
                name="title"
                id="title"
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
                name="description"
                id="description"
                rows="3"
                required
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="prompt"
                className="text-xs font-medium text-muted"
              >
                AI Prompt
              </label>
              <textarea
                placeholder="Paste the prompt used to generate this wallpaper (optional)"
                name="prompt"
                id="prompt"
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
              <select name="category" id="category" className={inputClass}>
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
                name="tags"
                id="tags"
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
              {albums.length === 0 && (
                <p className="text-xs text-muted">
                  Create an album from your profile to group wallpapers
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
                name="link"
                id="link"
                className={inputClass}
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={uploading || !file}
              className="btn-primary mt-2 w-full py-3 text-sm disabled:opacity-50"
            >
              {uploading
                ? `Uploading raw image... ${uploadProgress}%`
                : "Publish wallpaper"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default CreatePage;
