"use client";

export default function CreateHeader({
  isEditing,
  uploadProvider,
  draftId,
  savingDraft,
  uploading,
  uploadProgress,
  file,
  uploadedMedia,
  error,
  info,
  onSaveDraft,
  onPublish,
}) {
  return (
    <>
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
            onClick={onSaveDraft}
            disabled={savingDraft || uploading}
            className="rounded-full border border-line px-4 py-2.5 text-sm font-medium text-fog transition-colors hover:bg-panel-hover disabled:opacity-50"
          >
            {savingDraft ? "Saving…" : "Save draft"}
          </button>
          {(file || uploadedMedia) && (
            <button
              onClick={onPublish}
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
    </>
  );
}
