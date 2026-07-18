"use client";

export function getShareUrl(path) {
  if (typeof window === "undefined") return path || "";
  if (!path) return window.location.href;
  if (path.startsWith("http")) return path;
  return `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function shareContent({ title, text, url } = {}) {
  const shareUrl = getShareUrl(url);
  const payload = {
    title: title || document.title,
    text: text || "",
    url: shareUrl,
  };

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(payload);
      return { method: "native" };
    } catch (err) {
      if (err?.name === "AbortError") return { method: "cancelled" };
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(shareUrl);
    return { method: "clipboard" };
  }

  // Fallback for older browsers
  window.prompt("Copy this link:", shareUrl);
  return { method: "prompt" };
}
