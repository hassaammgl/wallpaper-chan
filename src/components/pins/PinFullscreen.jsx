"use client";

import { useEffect, useRef } from "react";
import { HiXMark } from "react-icons/hi2";

export default function PinFullscreen({ src, title, onClose }) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Full screen wallpaper preview"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-[101] flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20"
        aria-label="Close full screen"
      >
        <HiXMark size={22} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={title || "Wallpaper"}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: "92vh",
          maxWidth: "96vw",
          width: "auto",
          height: "auto",
          objectFit: "contain",
          borderRadius: 12,
        }}
      />
    </div>
  );
}
