"use client";

import Link from "next/link";
import Image from "@/components/Image/Image";
import AdminPagination from "@/components/admin/AdminPagination";
import { format } from "timeago.js";
import {
  HiPencilSquare,
  HiTrash,
  HiEye,
  HiEyeSlash,
  HiRectangleStack,
} from "react-icons/hi2";

function AlbumsTable({
  albums,
  loading,
  page,
  pages,
  onPageChange,
  onEdit,
  onDelete,
  onCreate,
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  if (!albums?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] border border-line glass py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-panel text-muted">
          <HiRectangleStack size={24} />
        </div>
        <p className="font-medium text-fog">No albums yet</p>
        <p className="max-w-sm text-sm text-muted">
          Create an album to group wallpapers when you publish.
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="btn-primary mt-2 px-4 py-2 text-sm"
        >
          Create album
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {albums.map((album) => (
          <div
            key={album._id}
            className="overflow-hidden rounded-[20px] border border-line glass"
          >
            <div className="relative aspect-video w-full bg-canvas">
              {album.firstPin?.media ? (
                <Image
                  path={album.firstPin.media}
                  pin={album.firstPin}
                  alt={album.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted">
                  <HiRectangleStack size={28} />
                </div>
              )}
            </div>
            <div className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="truncate font-semibold text-fog">{album.title}</h3>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-panel px-2 py-0.5 text-[10px] text-muted">
                  {album.isPublic ? (
                    <>
                      <HiEye size={10} /> Public
                    </>
                  ) : (
                    <>
                      <HiEyeSlash size={10} /> Private
                    </>
                  )}
                </span>
              </div>
              {album.description && (
                <p className="line-clamp-2 text-xs text-muted">
                  {album.description}
                </p>
              )}
              <p className="text-xs text-muted">
                {album.pinCount} wallpaper{album.pinCount !== 1 ? "s" : ""}
                {album.user?.userName ? ` · @${album.user.userName}` : ""}
                {album.createdAt ? ` · ${format(album.createdAt)}` : ""}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={`/albums/${album._id}`}
                  target="_blank"
                  className="flex-1 rounded-xl border border-line py-2 text-center text-xs font-medium text-fog hover:bg-panel-hover"
                >
                  View
                </Link>
                <button
                  type="button"
                  onClick={() => onEdit(album)}
                  className="rounded-xl border border-line px-3 py-2 text-fog hover:bg-panel-hover"
                  title="Edit"
                >
                  <HiPencilSquare size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(album._id)}
                  className="rounded-xl border border-danger/30 px-3 py-2 text-danger hover:bg-danger/10"
                  title="Delete"
                >
                  <HiTrash size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AdminPagination page={page} pages={pages} onPageChange={onPageChange} />
    </>
  );
}

export default AlbumsTable;
