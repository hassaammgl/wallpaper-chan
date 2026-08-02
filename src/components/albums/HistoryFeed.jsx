"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "@/components/Image/Image";
import apiRequest from "@/lib/apiRequest";
import { HiClock } from "react-icons/hi2";

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

export default HistoryFeed;
