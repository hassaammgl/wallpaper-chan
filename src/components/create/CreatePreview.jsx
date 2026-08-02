"use client";

import { HiPencilSquare, HiArrowUpTray } from "react-icons/hi2";

export default function CreatePreview({
  previewImg,
  uploadedMedia,
  onEdit,
  onFileChange,
}) {
  return (
    <div className="rounded-[28px] border border-line glass p-5">
      {previewImg.url ? (
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-canvas p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewImg.url}
            alt="Preview"
            style={{
              maxHeight: 380,
              maxWidth: "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              display: "block",
            }}
          />
          {previewImg.width > 0 && (
            <span className="mt-2 font-mono text-xs text-muted">
              {previewImg.width}x{previewImg.height} · Full HD original
              preserved
            </span>
          )}
          <button
            onClick={onEdit}
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
              onChange={onFileChange}
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
            <p className="font-medium text-fog">Drop your wallpaper here</p>
            <p className="mt-1 text-sm text-muted">
              Original quality — drafts keep the upload if publish fails
            </p>
          </div>
          <input
            className="hidden"
            id="file"
            onChange={onFileChange}
            type="file"
            accept="image/*"
          />
        </label>
      )}
    </div>
  );
}
