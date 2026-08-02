"use client";

import { HiArrowsPointingOut } from "react-icons/hi2";

export default function PinPreview({ src, title, onOpenFullscreen }) {
  return (
    <div
      className="group relative flex cursor-zoom-in items-center justify-center overflow-hidden bg-canvas"
      style={{ height: "min(52vh, 480px)", maxHeight: 480 }}
      onClick={() => src && onOpenFullscreen()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (src) onOpenFullscreen();
        }
      }}
      aria-label="Open full screen preview"
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={title || "Wallpaper"}
          style={{
            maxHeight: "100%",
            maxWidth: "100%",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            display: "block",
          }}
          loading="eager"
        />
      ) : (
        <p className="text-sm text-muted">No preview</p>
      )}
      {src && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenFullscreen();
          }}
          className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-ink/70 px-3 py-1.5 text-xs font-medium text-white opacity-100 backdrop-blur-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
        >
          <HiArrowsPointingOut size={14} />
          Full screen
        </button>
      )}
    </div>
  );
}
