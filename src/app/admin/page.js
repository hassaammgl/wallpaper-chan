"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "@/components/Image/Image";
import apiRequest from "@/lib/apiRequest";
import { format } from "timeago.js";

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-[20px] border border-line glass p-5 transition-all hover:glow-ring">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-gradient">
        {value?.toLocaleString() ?? "—"}
      </p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
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
      <div>
        <h1 className="text-3xl font-bold text-fog">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Platform overview and recent activity
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Users" value={totals.users} />
        <StatCard label="Pins" value={totals.pins} />
        <StatCard label="Comments" value={totals.comments} />
        <StatCard label="Boards" value={totals.boards} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Likes" value={totals.likes} sub="Total interactions" />
        <StatCard label="Follows" value={totals.follows} sub="User connections" />
        <StatCard label="Saves" value={totals.saves} sub="Saved pins" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[20px] border border-line glass p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-fog">Recent Users</h2>
            <Link
              href="/admin/users"
              className="text-xs font-medium text-accent hover:text-accent-hover"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers?.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 rounded-xl bg-panel/50 p-3"
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
                  <p className="truncate text-xs text-muted">
                    @{user.userName}
                  </p>
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

        <section className="rounded-[20px] border border-line glass p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-fog">Recent Pins</h2>
            <Link
              href="/admin/pins"
              className="text-xs font-medium text-accent hover:text-accent-hover"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentPins?.map((pin) => (
              <div
                key={pin._id}
                className="flex items-center gap-3 rounded-xl bg-panel/50 p-3"
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
                  className="text-xs text-accent hover:underline"
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
