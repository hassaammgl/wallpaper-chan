"use client";

import Link from "next/link";
import Image from "@/components/Image/Image";

function GalleryItem({ item }) {
  const pinHeight = Number(item.height) || 1200;
  const pinWidth = Number(item.width) || 800;
  const aspect = Math.min(1.85, Math.max(0.55, pinHeight / pinWidth));

  return (
    <Link
      href={`/pins/${item._id}`}
      className="group block overflow-hidden rounded-2xl bg-panel ring-1 ring-line transition-all hover:ring-accent/35 hover:shadow-lg hover:shadow-black/20"
      style={{ aspectRatio: `${pinWidth} / ${Math.round(pinWidth * aspect)}` }}
      aria-label={item.title || "Open wallpaper"}
    >
      <div className="relative h-full w-full">
        <Image
          path={item.media}
          pin={item}
          uploadProvider={item.uploadProvider}
          mode="display"
          w={480}
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
