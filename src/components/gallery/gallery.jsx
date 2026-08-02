"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import GalleryItem from "@/components/galleryItems/galleryItems";
import apiRequest from "@/lib/apiRequest";

function PinSkeleton() {
  return (
    <div className="aspect-3/4 animate-pulse rounded-2xl bg-panel ring-1 ring-line" />
  );
}

function buildParams({ search, userId, boardId, deviceType, cursor }) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", String(cursor));
  if (search) params.set("search", search);
  if (userId) params.set("userId", userId);
  if (boardId) params.set("boardId", boardId);
  if (deviceType) params.set("deviceType", deviceType);
  return params;
}

function Gallery({ search, userId, boardId, deviceType }) {
  const [pins, setPins] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);
  const cursorRef = useRef(null);

  const fetchPinsPage = useCallback(
    async ({ reset = false } = {}) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);

      try {
        const params = buildParams({
          search,
          userId,
          boardId,
          deviceType,
          cursor: reset ? undefined : cursorRef.current || undefined,
        });
        const res = await apiRequest.get(`/api/pins?${params.toString()}`);
        const data = res.data;
        const nextPins = Array.isArray(data?.pins) ? data.pins : [];
        const nextCursor = data?.nextCursor ?? null;

        setPins((prev) => (reset ? nextPins : [...prev, ...nextPins]));
        cursorRef.current = nextCursor;
        setCursor(nextCursor);
        setHasMore(!!nextCursor);
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Failed to load"
        );
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [search, userId, boardId, deviceType]
  );

  useEffect(() => {
    cursorRef.current = null;
    setPins([]);
    setCursor(null);
    setHasMore(true);
    let cancelled = false;

    (async () => {
      await fetchPinsPage({ reset: true });
      if (cancelled) return;
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchPinsPage]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingRef.current) {
          fetchPinsPage({ reset: false });
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, fetchPinsPage]);

  if (loading && pins.length === 0) {
    return (
      <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="mb-3 break-inside-avoid">
            <PinSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (error && pins.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-panel/40 py-16 text-center">
        <p className="font-medium text-fog">Couldn&apos;t load wallpapers</p>
        <p className="mt-1 text-sm text-muted">{error}</p>
      </div>
    );
  }

  if (pins.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-panel/40 py-16 text-center">
        <p className="font-medium text-fog">No wallpapers found</p>
        <p className="mt-1 text-sm text-muted">
          Try a different filter or check back later
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">
        {pins.map((item) => (
          <div key={item._id} className="mb-3 break-inside-avoid">
            <GalleryItem item={item} />
          </div>
        ))}
      </div>
      <div ref={sentinelRef} className="h-8" aria-hidden />
      {loading && (
        <div className="flex justify-center py-6">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-accent" />
        </div>
      )}
      {!hasMore && (
        <p className="py-8 text-center text-sm text-muted">That&apos;s all</p>
      )}
    </div>
  );
}

export default Gallery;
