export const inputClass =
  "w-full rounded-2xl border border-line bg-canvas/80 px-4 py-3 text-sm text-fog outline-none transition-all placeholder:text-muted focus:border-accent/50 focus:ring-2 focus:ring-accent/20";

export const CATEGORIES = [
  "general",
  "anime",
  "nature",
  "abstract",
  "gaming",
  "minimal",
  "dark",
  "amoled",
  "cars",
  "space",
  "fantasy",
  "cityscape",
];

export const SUGGESTED_TAGS = [
  "4k",
  "hd",
  "mobile",
  "desktop",
  "portrait",
  "landscape",
  "dark",
  "light",
  "minimal",
  "anime",
  "nature",
  "gaming",
  "amoled",
  "abstract",
  "wallpaper",
];

export function formatDraftTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
