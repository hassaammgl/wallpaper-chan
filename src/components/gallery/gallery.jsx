"use client";

import { useState, useEffect } from "react";
import GalleryItem from "@/components/galleryItems/galleryItems";
import apiRequest from "@/lib/apiRequest";

function PinSkeleton() {
  return (
    <div className="aspect-[3/4] animate-pulse rounded-2xl bg-panel ring-1 ring-line" />
  );
}

function Gallery({ search, userId, boardId, deviceType }) {
  const [pins, setPins] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPins = async (reset = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (!reset) params.set("cursor", String(cursor));
      if (search) params.set("search", search);
      if (userId) params.set("userId", userId);
      if (boardId) params.set("boardId", boardId);
      if (deviceType) params.set("deviceType", deviceType);

      const res = await apiRequest.get(`/api/pins?${params.toString()}`);
      const data = res.data;
      const nextPins = Array.isArray(data?.pins) ? data.pins : [];

      if (reset) {
        setPins(nextPins);
      } else {
        setPins((prev) => [...prev, ...nextPins]);
      }
      setCursor(data?.nextCursor ?? null);
      setHasMore(!!data?.nextCursor);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setPins([]);
        setCursor(0);
        setHasMore(true);

        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (userId) params.set("userId", userId);
        if (boardId) params.set("boardId", boardId);
        if (deviceType) params.set("deviceType", deviceType);

        const res = await apiRequest.get(`/api/pins?${params.toString()}`);
        if (cancelled) return;
        const data = res.data;
        setPins(Array.isArray(data?.pins) ? data.pins : []);
        setCursor(data?.nextCursor ?? null);
        setHasMore(!!data?.nextCursor);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [search, userId, boardId, deviceType]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 500 &&
        hasMore &&
        !loading
      ) {
        fetchPins(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, cursor]);

  if (loading && pins.length === 0) {
    return (
      <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="mb-3 break-inside-avoid">
            <PinSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-line bg-panel/40 py-16 text-center">
        <p className="font-medium text-fog">Couldn&apos;t load wallpapers</p>
        <p className="mt-1 text-sm text-muted">Try again in a moment</p>
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
      <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6">
        {pins.map((item) => (
          <div key={item._id} className="mb-3 break-inside-avoid">
            <GalleryItem item={item} />
          </div>
        ))}
      </div>
      {loading && (
        <div className="flex justify-center py-8">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-accent" />
        </div>
      )}
      {!hasMore && pins.length > 0 && (
        <p className="py-8 text-center text-sm text-muted">That&apos;s all</p>
      )}
    </div>
  );
}

export default Gallery;
