"use client";

import { useRouter } from "next/navigation";
import Image from "@/components/Image/Image";
import { formatDraftTime } from "@/components/create/createConstants";
import {
  HiDocumentDuplicate,
  HiTrash,
  HiClock,
  HiPhoto,
} from "react-icons/hi2";

export default function DraftsPanel({
  drafts,
  draftId,
  onApplyDraft,
  onDeleteDraft,
}) {
  const router = useRouter();

  if (drafts.length === 0) return null;

  return (
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
                onApplyDraft(draft);
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
              onClick={() => onDeleteDraft(draft._id)}
              className="rounded-xl border border-danger/30 p-2 text-danger hover:bg-danger/10"
              title="Delete draft"
            >
              <HiTrash size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
