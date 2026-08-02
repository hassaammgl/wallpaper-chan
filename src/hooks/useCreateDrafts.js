"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import apiRequest from "@/lib/apiRequest";
import { buildDraftMedia, buildDraftPayload } from "@/lib/createDraftHelpers";

export function useCreateDrafts({ form, currentUser }) {
  const [drafts, setDrafts] = useState([]);
  const [draftId, setDraftId] = useState(null);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const autoSaveTimer = useRef(null);
  const hydratedDraft = useRef(false);
  const formRef = useRef(form);
  formRef.current = form;

  const loadDrafts = useCallback(async () => {
    try {
      const res = await apiRequest.get("/api/drafts");
      setDrafts(Array.isArray(res.data) ? res.data : []);
    } catch {
      // non-fatal: drafts panel stays empty
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === "admin") loadDrafts();
  }, [currentUser?.role, loadDrafts]);

  const applyDraft = useCallback((draft) => {
    const f = formRef.current;
    setDraftId(draft._id);
    f.setTitle(draft.title || "");
    f.setDescription(draft.description || "");
    f.setPrompt(draft.prompt || "");
    f.setLink(draft.link || "");
    f.setCategory(draft.category || "general");
    f.setDeviceType(draft.deviceType || "both");
    f.setSelectedAlbum(
      draft.board && draft.board !== "general" ? draft.board : ""
    );
    f.setSelectedTags(Array.isArray(draft.tags) ? draft.tags : []);
    f.setCustomTags("");
    f.setFile(null);
    f.setError("");
    f.setInfo(`Resumed draft: ${draft.title || draft.fileName || "Untitled"}`);
    const media = buildDraftMedia(draft);
    f.setUploadedMedia(media.uploadedMedia);
    f.setPreviewImg(media.previewImg);
  }, []);

  const collectDraftPayload = useCallback(() => {
    const f = formRef.current;
    return buildDraftPayload({
      draftId,
      title: f.title,
      description: f.description,
      prompt: f.prompt,
      link: f.link,
      selectedAlbum: f.selectedAlbum,
      selectedTags: f.selectedTags,
      customTags: f.customTags,
      deviceType: f.deviceType,
      category: f.category,
      uploadedMedia: f.uploadedMedia,
      previewImg: f.previewImg,
      file: f.file,
    });
  }, [draftId]);

  const saveDraft = useCallback(
    async ({ silent = false } = {}) => {
      const f = formRef.current;
      const payload = collectDraftPayload();
      if (!payload.media && !payload.title && !payload.description && !f.file) {
        if (!silent) {
          f.setError("Add an image or some details before saving a draft");
        }
        return null;
      }

      if (!silent) f.setSavingDraft(true);
      try {
        const res = await apiRequest.post("/api/drafts", payload);
        setDraftId(res.data._id);
        await loadDrafts();
        if (!silent) {
          f.setInfo("Draft saved — you can leave and resume anytime");
        }
        return res.data;
      } catch (err) {
        if (!silent) {
          f.setError(err.response?.data?.message || "Failed to save draft");
        }
        return null;
      } finally {
        if (!silent) f.setSavingDraft(false);
      }
    },
    [collectDraftPayload, loadDrafts]
  );

  useEffect(() => {
    if (currentUser?.role !== "admin") return;
    const f = formRef.current;
    if (!f.uploadedMedia?.filePath && !f.title && !f.description) return;

    if (autoSaveTimer.current) window.clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = window.setTimeout(() => {
      saveDraft({ silent: true });
    }, 1200);

    return () => {
      if (autoSaveTimer.current) window.clearTimeout(autoSaveTimer.current);
    };
  }, [
    currentUser?.role,
    form.uploadedMedia,
    form.title,
    form.description,
    form.prompt,
    form.link,
    form.selectedTags,
    form.customTags,
    form.deviceType,
    form.category,
    form.selectedAlbum,
    saveDraft,
  ]);

  return {
    drafts,
    draftId,
    setDraftId,
    loadingDraft,
    setLoadingDraft,
    hydratedDraft,
    applyDraft,
    collectDraftPayload,
    saveDraft,
    loadDrafts,
  };
}
