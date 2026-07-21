"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "@/components/Image/Image";
import apiRequest from "@/lib/apiRequest";
import useAuthStore from "@/stores/authStore";
import { HiBell, HiChatBubbleBottomCenterText } from "react-icons/hi2";

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function AlertsPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser) router.push("/auth");
  }, [currentUser, router]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiRequest.get("/api/alerts?limit=40");
      setComments(res.data.comments || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) load();
  }, [currentUser, load]);

  if (!currentUser) return null;

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-accent">
          <HiBell size={14} />
          Alerts
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-fog">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-muted">
          Comments on your wallpapers
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] border border-line glass py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-panel">
            <HiBell size={28} className="text-muted" />
          </div>
          <p className="text-lg font-medium text-fog">No notifications yet</p>
          <p className="max-w-sm text-sm text-muted">
            When someone comments on your wallpapers, you&apos;ll see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const author = comment.user;
            const pin = comment.pin;
            return (
              <Link
                key={comment._id}
                href={pin?._id ? `/pins/${pin._id}` : "/alerts"}
                className="flex gap-3 rounded-[22px] border border-line glass p-4 transition-colors hover:border-accent/30 hover:bg-panel/40"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <HiChatBubbleBottomCenterText size={18} />
                </div>
                <Image
                  path={author?.img || "/general/noAvatar.svg"}
                  alt={author?.displayName || "User"}
                  w={44}
                  h={44}
                  className="h-11 w-11 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-fog">
                      <span className="font-semibold">
                        {author?.displayName || author?.userName || "Someone"}
                      </span>{" "}
                      <span className="text-muted">commented on</span>{" "}
                      <span className="font-medium text-accent">
                        {pin?.title || "your wallpaper"}
                      </span>
                    </p>
                    <span className="shrink-0 text-[11px] text-muted">
                      {formatTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {comment.description}
                  </p>
                </div>
                {pin?.media && (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line">
                    <Image
                      path={pin.media}
                      pin={pin}
                      uploadProvider={pin.uploadProvider}
                      alt={pin.title || ""}
                      w={56}
                      h={56}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AlertsPage;
