"use client";

import { useState, useEffect } from "react";

const EMPTY_PREVIEW = { url: "", width: 0, height: 0 };

export function useCreateFormState() {
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
  const [previewImg, setPreviewImg] = useState(EMPTY_PREVIEW);
  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState("");

  useEffect(() => {
    if (!file) return;
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    img.onload = () => {
      setPreviewImg({ url: objectUrl, width: img.width, height: img.height });
      setUploadedMedia(null);
    };
  }, [file]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const resetFormFields = () => {
    setFile(null);
    setUploadedMedia(null);
    setPreviewImg(EMPTY_PREVIEW);
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
  };

  return {
    file,
    setFile,
    isEditing,
    setIsEditing,
    uploading,
    setUploading,
    savingDraft,
    setSavingDraft,
    uploadProgress,
    setUploadProgress,
    error,
    setError,
    info,
    setInfo,
    uploadProvider,
    setUploadProvider,
    deviceType,
    setDeviceType,
    selectedTags,
    setSelectedTags,
    customTags,
    setCustomTags,
    title,
    setTitle,
    description,
    setDescription,
    prompt,
    setPrompt,
    link,
    setLink,
    category,
    setCategory,
    previewImg,
    setPreviewImg,
    uploadedMedia,
    setUploadedMedia,
    albums,
    setAlbums,
    selectedAlbum,
    setSelectedAlbum,
    toggleTag,
    resetFormFields,
  };
}
