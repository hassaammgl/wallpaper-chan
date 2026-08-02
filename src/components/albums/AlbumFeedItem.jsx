import Link from "next/link";
import Image from "@/components/Image/Image";
import { HiSparkles } from "react-icons/hi2";

function AlbumFeedItem({ pin }) {
  return (
    <Link
      href={`/pins/${pin._id}`}
      className="block overflow-hidden rounded-[24px] border border-line bg-panel/40 transition-all hover:border-accent/30 hover:bg-panel-hover"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-canvas">
        <Image
          path={pin.media}
          pin={pin}
          alt={pin.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-fog">{pin.title}</h3>
            {pin.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted">
                {pin.description}
              </p>
            )}
          </div>
          {pin.user && (
            <div className="flex shrink-0 items-center gap-2">
              <Image
                path={pin.user.img || "/general/noAvatar.svg"}
                alt={pin.user.displayName}
                w={32}
                h={32}
                className="h-8 w-8 rounded-lg object-cover"
              />
            </div>
          )}
        </div>

        {pin.prompt && (
          <div className="rounded-xl border border-line bg-canvas/80 p-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-accent">
              <HiSparkles size={12} />
              AI Prompt
            </div>
            <p className="line-clamp-3 font-mono text-xs leading-relaxed text-muted">
              {pin.prompt}
            </p>
          </div>
        )}

        {pin.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {pin.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default AlbumFeedItem;
