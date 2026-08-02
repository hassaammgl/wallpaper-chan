"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import useEditStore from "@/stores/editorStore";
import apiRequest from "@/lib/apiRequest";
import {
  validateCreateForm,
  publishCreatedPin,
} from "@/lib/createPinActions";
import { useCreateFormState } from "@/hooks/useCreateFormState";
import { useCreateDrafts } from "@/hooks/useCreateDrafts";

export function useCreateWallpaper() {
  const { currentUser } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftParam = searchParams.get("draft");
  const { textOptions, canvasOptions } = useEditStore();
  const form = useCreateFormState();
  const draftsApi = useCreateDrafts({ form, currentUser, router });

  useEffect(() => {
    if (!currentUser) {
      router.push("/auth");
      return;
    }
    if (currentUser.role !== "admin") router.replace("/");
  }, [router, currentUser]);

  useEffect(() => {
    apiRequest
      .get("/api/upload/config")
      .then((res) => form.setUploadProvider(res.data.data.provider))
      .catch(() => {
        // non-fatal: upload provider defaults to imagekit
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setters are stable
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;
    apiRequest
      .get(`/api/boards/${currentUser.id}`)
      .then((res) => form.setAlbums(Array.isArray(res.data) ? res.data : []))
      .catch(() => {
        // non-fatal: album picker stays empty
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setters are stable
  }, [currentUser?.id]);

  useEffect(() => {
    if (!draftParam || draftsApi.hydratedDraft.current) return;
    if (currentUser?.role !== "admin") return;
    draftsApi.hydratedDraft.current = true;
    draftsApi.setLoadingDraft(true);
    apiRequest
      .get(`/api/drafts/${draftParam}`)
      .then((res) => draftsApi.applyDraft(res.data))
      .catch(() => form.setError("Could not load draft"))
      .finally(() => draftsApi.setLoadingDraft(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftParam, currentUser?.role]);

  const resetForm = () => {
    draftsApi.setDraftId(null);
    form.resetFormFields();
    router.replace("/create");
  };

  const handleDeleteDraft = async (id) => {
    if (!confirm("Delete this draft?")) return;
    try {
      await apiRequest.delete(`/api/drafts/${id}`);
      if (draftsApi.draftId === id) resetForm();
      await draftsApi.loadDrafts();
    } catch {
      form.setError("Failed to delete draft");
    }
  };

  const publishWallpaper = async () => {
    if (form.isEditing) {
      form.setIsEditing(false);
      return;
    }
    const validated = validateCreateForm({
      file: form.file,
      uploadedMedia: form.uploadedMedia,
      title: form.title,
      description: form.description,
    });
    if (validated.error) {
      form.setError(validated.error);
      return;
    }

    form.setError("");
    form.setInfo("");
    form.setUploading(true);
    form.setUploadProgress(0);
    try {
      const { mediaData, pin } = await publishCreatedPin({
        file: form.file,
        uploadedMedia: form.uploadedMedia,
        onProgress: form.setUploadProgress,
        collectDraftPayload: draftsApi.collectDraftPayload,
        apiRequest,
        draftId: draftsApi.draftId,
        form: {
          title: form.title,
          description: form.description,
          prompt: form.prompt,
          link: form.link,
          selectedAlbum: form.selectedAlbum,
          selectedTags: form.selectedTags,
          customTags: form.customTags,
          deviceType: form.deviceType,
          category: form.category,
          textOptions,
          canvasOptions,
        },
      });
      form.setUploadedMedia(mediaData);
      router.push(`/pins/${pin._id}`);
    } catch (err) {
      form.setError(
        err.response?.data?.message || err.message || "Upload failed"
      );
      await draftsApi.saveDraft({ silent: true });
      form.setInfo("Progress saved as draft — fix the issue and publish again");
    } finally {
      form.setUploading(false);
    }
  };

  return {
    currentUser,
    ...form,
    drafts: draftsApi.drafts,
    draftId: draftsApi.draftId,
    loadingDraft: draftsApi.loadingDraft,
    applyDraft: draftsApi.applyDraft,
    saveDraft: draftsApi.saveDraft,
    publishWallpaper,
    handleDeleteDraft,
    resetForm,
  };
}
