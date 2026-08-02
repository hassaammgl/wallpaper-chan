"use client";

import Image from "@/components/Image/Image";
import AdminPagination from "@/components/admin/AdminPagination";
import { format } from "timeago.js";
import { HiTrash, HiNoSymbol, HiPencilSquare } from "react-icons/hi2";

function PinsTable({ pins, loading, page, pages, onPageChange, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pins?.map((pin) => (
          <div
            key={pin._id}
            className={`overflow-hidden rounded-[20px] border glass ${
              pin.userBlocked ? "border-danger/50 opacity-60" : "border-line"
            }`}
          >
            <div className="relative aspect-video w-full">
              <Image
                path={pin.media}
                pin={pin}
                alt={pin.title || "Pin preview"}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-2 p-4">
              <h3 className="truncate font-semibold text-fog">{pin.title}</h3>
              <p className="truncate text-xs text-muted">
                @{pin.user?.userName || "unknown"} ·{" "}
                {pin.resolution || `${pin.width}x${pin.height}`}
                {pin.createdAt ? ` · ${format(pin.createdAt)}` : ""}
                {pin.userBlocked && (
                  <span className="ml-2 inline-flex items-center gap-0.5 text-danger">
                    <HiNoSymbol size={10} />
                    Blocked user
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-1">
                {pin.deviceType && (
                  <span className="rounded-full bg-panel px-2 py-0.5 text-[10px] capitalize text-muted">
                    {pin.deviceType}
                  </span>
                )}
                {pin.category && (
                  <span className="rounded-full bg-panel px-2 py-0.5 text-[10px] capitalize text-muted">
                    {pin.category}
                  </span>
                )}
                {pin.uploadProvider && (
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] text-accent">
                    {pin.uploadProvider}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`/pins/${pin._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-xl border border-line py-2 text-center text-xs font-medium text-fog hover:bg-panel-hover"
                >
                  View
                </a>
                <button
                  type="button"
                  onClick={() => onEdit(pin)}
                  className="rounded-xl border border-line px-3 py-2 text-fog hover:bg-panel-hover"
                  title="Edit"
                >
                  <HiPencilSquare size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(pin._id)}
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

export default PinsTable;
