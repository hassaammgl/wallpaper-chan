"use client";

import Link from "next/link";
import StatCard from "@/components/admin/StatCard";
import RecentLists from "@/components/admin/RecentLists";
import {
  HiUsers,
  HiPhoto,
  HiRectangleStack,
  HiChatBubbleLeftRight,
  HiHeart,
  HiBookmark,
  HiUserGroup,
  HiArrowUpTray,
} from "react-icons/hi2";

function DashboardStats({ totals, recentUsers, recentPins }) {
  return (
    <div className="animate-fade-up space-y-8">
      <section className="overflow-hidden rounded-[28px] border border-line bg-linear-to-br from-parrot/15 via-panel/40 to-transparent p-6 lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Wallpaper studio
        </p>
        <h2 className="mt-2 max-w-xl text-3xl font-bold tracking-tight text-fog">
          Upload, organize, and moderate your wallpaper library
        </h2>
        <p className="mt-2 max-w-lg text-sm text-muted">
          Keep everything in one place — wallpapers, albums, users, and
          comments.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/create"
            className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm"
          >
            <HiArrowUpTray size={16} />
            Upload wallpaper
          </Link>
          <Link
            href="/admin/albums"
            className="rounded-full border border-line bg-panel/60 px-4 py-2.5 text-sm font-medium text-fog hover:bg-panel-hover"
          >
            Create album
          </Link>
          <Link
            href="/admin/pins"
            className="rounded-full border border-line bg-panel/60 px-4 py-2.5 text-sm font-medium text-fog hover:bg-panel-hover"
          >
            Manage pins
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Users"
          value={totals.users}
          icon={HiUsers}
          href="/admin/users"
        />
        <StatCard
          label="Wallpapers"
          value={totals.pins}
          icon={HiPhoto}
          href="/admin/pins"
        />
        <StatCard
          label="Albums"
          value={totals.boards}
          icon={HiRectangleStack}
          href="/admin/albums"
        />
        <StatCard
          label="Comments"
          value={totals.comments}
          icon={HiChatBubbleLeftRight}
          href="/admin/comments"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Likes" value={totals.likes} icon={HiHeart} />
        <StatCard label="Follows" value={totals.follows} icon={HiUserGroup} />
        <StatCard label="Saves" value={totals.saves} icon={HiBookmark} />
      </div>

      <RecentLists recentUsers={recentUsers} recentPins={recentPins} />
    </div>
  );
}

export default DashboardStats;
