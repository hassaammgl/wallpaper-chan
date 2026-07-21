"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "@/components/Image/Image";
import apiRequest from "@/lib/apiRequest";
import { format } from "timeago.js";
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

function StatCard({ label, value, icon: Icon, href }) {
  const content = (
    <div className="group rounded-[22px] border border-line bg-panel/60 p-5 transition-all hover:border-accent/30 hover:bg-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-fog">
            {value?.toLocaleString() ?? "—"}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent transition-transform group-hover:scale-105">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiRequest.get("/api/admin/stats");
        setData(res.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  if (error) return <p className="text-danger">Failed to load: {error}</p>;

  const { totals, recentUsers, recentPins } = data;

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
          Keep everything in one place — wallpapers, albums, users, and comments.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/create" className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm">
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
        <StatCard label="Users" value={totals.users} icon={HiUsers} href="/admin/users" />
        <StatCard label="Wallpapers" value={totals.pins} icon={HiPhoto} href="/admin/pins" />
        <StatCard label="Albums" value={totals.boards} icon={HiRectangleStack} href="/admin/albums" />
        <StatCard label="Comments" value={totals.comments} icon={HiChatBubbleLeftRight} href="/admin/comments" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Likes" value={totals.likes} icon={HiHeart} />
        <StatCard label="Follows" value={totals.follows} icon={HiUserGroup} />
        <StatCard label="Saves" value={totals.saves} icon={HiBookmark} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[24px] border border-line bg-panel/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-fog">Recent users</h2>
            <Link href="/admin/users" className="text-xs font-medium text-accent hover:underline">
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

        <section className="rounded-[24px] border border-line bg-panel/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-fog">Recent wallpapers</h2>
            <Link href="/admin/pins" className="text-xs font-medium text-accent hover:underline">
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
    </div>
  );
}

export default DashboardPage;
