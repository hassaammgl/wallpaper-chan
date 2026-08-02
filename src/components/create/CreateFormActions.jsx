export default function CreateFormActions({ c }) {
  return (
    <div className="flex gap-2 pt-1">
      <button
        type="button"
        onClick={() => c.saveDraft()}
        disabled={c.savingDraft || c.uploading}
        className="flex-1 rounded-2xl border border-line py-3 text-sm font-medium text-fog hover:bg-panel-hover disabled:opacity-50"
      >
        {c.savingDraft ? "Saving…" : "Save draft"}
      </button>
      <button
        type="submit"
        disabled={c.uploading || (!c.file && !c.uploadedMedia)}
        className="btn-primary flex-[1.4] py-3 text-sm disabled:opacity-50"
      >
        {c.uploading
          ? `Uploading… ${c.uploadProgress}%`
          : "Publish wallpaper"}
      </button>
    </div>
  );
}
