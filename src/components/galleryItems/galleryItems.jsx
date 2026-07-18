"use client";

import Link from "next/link";
import Image from "@/components/Image/Image";
import ShareButton from "@/components/ShareButton";
import { HiEllipsisHorizontal, HiBookmark } from "react-icons/hi2";

function GalleryItem({ item }) {
  return (
    <div
      className="group relative flex overflow-hidden rounded-[20px] ring-1 ring-line transition-all duration-300 hover:-translate-y-1 hover:ring-accent/30 hover:shadow-2xl hover:shadow-accent/10"
      style={{ gridRowEnd: `span ${Math.ceil(item.height / 100)}`, minHeight: 200 }}
    >
      <Image
        path={item.media}
        pin={item}
        uploadProvider={item.uploadProvider}
        mode="display"
        w={372}
        alt={item.title || ""}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />

      <Link
        href={`/pins/${item._id}`}
        className="absolute inset-0 z-0 bg-linear-to-t from-ink/80 via-ink/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <button
        type="button"
        className="absolute top-3 right-3 z-10 hidden items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-ink shadow-lg backdrop-blur-sm transition-transform group-hover:flex hover:scale-105"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <HiBookmark size={14} />
        Save
      </button>

      <div className="absolute right-3 bottom-3 z-10 hidden items-center gap-2 group-hover:flex">
        <ShareButton
          stopPropagation
          title={item.title}
          text={
            item.title
              ? `Check out this wallpaper: ${item.title}`
              : "Check out this wallpaper"
          }
          url={`/pins/${item._id}`}
          iconSize={16}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 disabled:opacity-50"
        />
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
          aria-label="More options"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <HiEllipsisHorizontal size={16} />
        </button>
      </div>

      {item.title && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="truncate text-sm font-medium text-white drop-shadow-lg">
            {item.title}
          </p>
          <div className="mt-1 flex gap-1">
            {item.deviceType && (
              <span className="rounded bg-black/40 px-1.5 py-0.5 text-[10px] capitalize text-white/80">
                {item.deviceType}
              </span>
            )}
            {item.resolution && (
              <span className="rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-white/80">
                {item.resolution}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GalleryItem;
