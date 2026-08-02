"use client";

import { Suspense } from "react";
import Editor from "@/components/editor/editor";
import CreatePreview from "@/components/create/CreatePreview";
import CreateForm from "@/components/create/CreateForm";
import CreateHeader from "@/components/create/CreateHeader";
import DraftsPanel from "@/components/create/DraftsPanel";
import { useCreateWallpaper } from "@/hooks/useCreateWallpaper";

function CreatePageContent() {
  const c = useCreateWallpaper();

  if (!c.currentUser || c.currentUser.role !== "admin") return null;

  if (c.loadingDraft) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl animate-fade-up">
      <CreateHeader
        isEditing={c.isEditing}
        uploadProvider={c.uploadProvider}
        draftId={c.draftId}
        savingDraft={c.savingDraft}
        uploading={c.uploading}
        uploadProgress={c.uploadProgress}
        file={c.file}
        uploadedMedia={c.uploadedMedia}
        error={c.error}
        info={c.info}
        onSaveDraft={() => c.saveDraft()}
        onPublish={c.publishWallpaper}
      />

      {!c.isEditing && (
        <DraftsPanel
          drafts={c.drafts}
          draftId={c.draftId}
          onApplyDraft={c.applyDraft}
          onDeleteDraft={c.handleDeleteDraft}
        />
      )}

      {c.isEditing ? (
        <Editor previewImg={c.previewImg} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <CreatePreview
            previewImg={c.previewImg}
            uploadedMedia={c.uploadedMedia}
            onEdit={() => c.setIsEditing(true)}
            onFileChange={(e) => c.setFile(e.target.files?.[0] || null)}
          />
          <CreateForm c={c} />
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
