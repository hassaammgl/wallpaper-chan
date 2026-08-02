"use client";

import Link from "next/link";
import Image from "@/components/Image/Image";
import { GALLERY_THUMB_WIDTH, DEFAULT_PIN_WIDTH } from "@/lib/constants";

function GalleryItem({ item }) {
  const pinWidth = Math.max(1, Number(item.width) || DEFAULT_PIN_WIDTH);
  const pinHeight = Math.max(
    1,
    Number(item.height) || Math.round(pinWidth * 1.25)
  );
  const ratio = Math.min(1.7, Math.max(0.65, pinHeight / pinWidth));

  return (
    <Link
      href={`/pins/${item._id}`}
      className="group block overflow-hidden rounded-2xl bg-panel ring-1 ring-line transition-all hover:ring-accent/35 hover:shadow-lg hover:shadow-black/20"
      style={{ aspectRatio: `1 / ${ratio.toFixed(3)}` }}
      aria-label={item.title || "Open wallpaper"}
    >
      <div className="relative h-full w-full">
        <Image
          path={item.media}
          pin={item}
          uploadProvider={item.uploadProvider}
          mode="display"
          w={GALLERY_THUMB_WIDTH}
          alt={item.title || "Wallpaper"}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {item.title && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/80 to-transparent p-2.5 pt-8 opacity-0 transition-opacity group-hover:opacity-100">
            <p className="truncate text-xs font-medium text-white">
              {item.title}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}

export default GalleryItem;
