"use client";

import Link from "next/link";
import Image from "@/components/Image/Image";
import { format } from "timeago.js";

function RecentLists({ recentUsers, recentPins }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-[24px] border border-line bg-panel/50 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-fog">Recent users</h2>
          <Link
            href="/admin/users"
            className="text-xs font-medium text-accent hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {recentUsers?.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-3 rounded-2xl border border-transparent bg-canvas/40 p-3 transition-colors hover:border-line"
            >
              <Image
                path={user.img || "/general/noAvatar.svg"}
                alt={user.displayName || user.userName || "User avatar"}
                w={36}
                h={36}
                className="h-9 w-9 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fog">
                  {user.displayName}
                </p>
                <p className="truncate text-xs text-muted">@{user.userName}</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  user.role === "admin"
                    ? "bg-accent-soft text-accent"
                    : "bg-panel text-muted"
                }`}
              >
                {user.role}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-panel/50 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-fog">Recent wallpapers</h2>
          <Link
            href="/admin/pins"
            className="text-xs font-medium text-accent hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {recentPins?.map((pin) => (
            <div
              key={pin._id}
              className="flex items-center gap-3 rounded-2xl border border-transparent bg-canvas/40 p-3 transition-colors hover:border-line"
            >
              <Image
                path={pin.media}
                pin={pin}
                alt={pin.title || "Pin preview"}
                w={48}
                h={48}
                className="h-12 w-12 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fog">
                  {pin.title}
                </p>
                <p className="truncate text-xs text-muted">
                  @{pin.user?.userName} · {format(pin.createdAt)}
                </p>
              </div>
              <Link
                href={`/pins/${pin._id}`}
                target="_blank"
                className="text-xs font-medium text-accent hover:underline"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default RecentLists;
