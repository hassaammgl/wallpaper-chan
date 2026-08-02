"use client";

import ShareButton from "@/components/ShareButton";
import OptionsMenu from "@/components/OptionsMenu";
import { buildPostMenuItems } from "@/components/postInteractions/buildPostMenuItems";
import { HiHeart } from "react-icons/hi2";

function PostActionBar({
  title,
  postId,
  likeCount,
  isLiked,
  isSaved,
  isAdmin,
  onLike,
  onSave,
  onCopyLink,
  onDownload,
  onEditAdmin,
  onDelete,
  onReport,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onLike}
          className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all ${
            isLiked
              ? "bg-parrot/15 text-parrot"
              : "text-muted hover:bg-panel-hover hover:text-fog"
          }`}
        >
          <HiHeart size={20} className={isLiked ? "fill-current" : ""} />
          {likeCount}
        </button>
        <ShareButton
          title={title}
          text={
            title
              ? `Check out this wallpaper: ${title}`
              : "Check out this wallpaper"
          }
          url={`/pins/${postId}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-panel-hover hover:text-fog disabled:opacity-50"
        />
        <OptionsMenu
          align="left"
          buttonClassName="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-panel-hover hover:text-fog"
          items={buildPostMenuItems({
            isAdmin,
            isSaved,
            onCopyLink,
            onDownload,
            onSave,
            onEditAdmin,
            onDelete,
            onReport,
          })}
        />
      </div>

      <button
        type="button"
        onClick={onSave}
        className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 ${
          isSaved
            ? "border border-accent/40 bg-accent-soft text-accent"
            : "btn-primary"
        }`}
      >
        {isSaved ? "Saved" : "Save"}
      </button>
    </div>
  );
}

export default PostActionBar;
