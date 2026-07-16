"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "@/components/Image/Image";
import apiRequest from "@/lib/apiRequest";
import { HiBookmark, HiClock } from "react-icons/hi2";

function SavedPins({ userId }) {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await apiRequest.get(`/api/pins/saved?userId=${userId}`);
        setPins(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-[20px] bg-panel" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-line glass py-16 text-center">
        <p className="text-sm text-muted">{error}</p>
      </div>
    );
  }

  if (!pins.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[28px] border border-line glass py-16 text-center">
        <HiBookmark size={40} className="text-muted" />
        <p className="text-fog font-medium">No saved wallpapers</p>
        <p className="text-sm text-muted">
          Tap the bookmark icon on any wallpaper to save it here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {pins.map((pin) => (
        <Link
          key={pin._id}
          href={`/pins/${pin._id}`}
          className="group relative aspect-[3/4] overflow-hidden rounded-[20px] ring-1 ring-line transition-all hover:-translate-y-1 hover:ring-accent/30"
        >
          <Image
            path={pin.media}
            pin={pin}
            alt={pin.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/70 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
            <p className="truncate text-sm font-medium text-white">{pin.title}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function HistoryFeed({ userId }) {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await apiRequest.get(`/api/history?userId=${userId}`);
        setPins(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse rounded-2xl bg-panel p-4">
            <div className="h-20 w-20 rounded-xl bg-line" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-line" />
              <div className="h-3 w-full rounded bg-line" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-line glass py-16 text-center">
        <p className="text-sm text-muted">{error}</p>
      </div>
    );
  }

  if (!pins.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[28px] border border-line glass py-16 text-center">
        <HiClock size={40} className="text-muted" />
        <p className="text-fog font-medium">No history yet</p>
        <p className="text-sm text-muted">
          Wallpapers you view will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pins.map((pin) => (
        <Link
          key={pin._id}
          href={`/pins/${pin._id}`}
          className="flex gap-4 rounded-2xl border border-line bg-panel/50 p-4 transition-all hover:border-accent/30 hover:bg-panel-hover"
        >
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-line">
            <Image
              path={pin.media}
              pin={pin}
              alt={pin.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-fog">{pin.title}</p>
            {pin.user && (
              <p className="text-xs text-muted">@{pin.user.userName}</p>
            )}
            {pin.viewedAt && (
              <p className="mt-1 text-xs text-muted">
                Viewed {new Date(pin.viewedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

export { SavedPins, HistoryFeed };
