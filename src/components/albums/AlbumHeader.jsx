"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "@/components/Image/Image";
import {
  HiArrowLeft,
  HiSquares2X2,
  HiQueueList,
  HiChatBubbleLeftRight,
} from "react-icons/hi2";

const tabs = [
  { key: "grid", label: "Grid", icon: HiSquares2X2 },
  { key: "feed", label: "Feed", icon: HiQueueList },
  { key: "comments", label: "Comments", icon: HiChatBubbleLeftRight },
];

function AlbumHeader({ data, view, onViewChange }) {
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 rounded-full border border-line bg-panel/60 px-4 py-2 text-sm text-muted transition-all hover:border-accent/30 hover:text-fog"
      >
        <HiArrowLeft size={16} />
        Back
      </button>

      <div className="overflow-hidden rounded-[28px] border border-line glass p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-fog">{data.title}</h1>
              {!data.isPublic && (
                <span className="rounded-full bg-panel px-2.5 py-0.5 text-xs text-muted">
                  Private
                </span>
              )}
            </div>
            {data.description && (
              <p className="max-w-xl text-muted leading-relaxed">
                {data.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted">
              <span>{data.pinCount} wallpapers</span>
              <span>{data.commentCount} comments</span>
            </div>
            {data.owner && (
              <Link
                href={`/${data.owner.userName}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-line bg-panel/50 px-3 py-2 transition-colors hover:bg-panel-hover"
              >
                <Image
                  path={data.owner.img || "/general/noAvatar.svg"}
                  alt={data.owner.displayName}
                  w={32}
                  h={32}
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <span className="text-sm font-medium text-fog">
                  {data.owner.displayName}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-1 rounded-2xl border border-line bg-panel/50 p-1 w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onViewChange(key)}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
              view === key
                ? "bg-accent-soft text-accent shadow-sm"
                : "text-muted hover:text-fog"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
    </>
  );
}

export default AlbumHeader;
