"use client";

/**
 * Force a real file download (works for same-origin API proxy).
 * Cross-origin CDN links ignore the HTML download attribute and just open.
 */
export async function downloadPin(pinId, fallbackName = "wallpaper.jpg") {
  const response = await fetch(`/api/pins/${pinId}/download`, {
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Download failed";
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const disposition = response.headers.get("Content-Disposition") || "";
  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
  const filename = decodeURIComponent(
    utfMatch?.[1] || plainMatch?.[1] || fallbackName
  );

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}
