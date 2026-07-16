"use client";

import { useState, useEffect } from "react";
import Image from "@/components/Image/Image";
import apiRequest from "@/lib/apiRequest";
import { format } from "timeago.js";
import { HiMagnifyingGlass, HiTrash, HiNoSymbol } from "react-icons/hi2";

function PinsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPins = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (query) params.set("search", query);
      const res = await apiRequest.get(`/api/admin/pins?${params}`);
      setData(res.data.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPins();
  }, [page, query]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(search);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this pin?")) return;
    try {
      await apiRequest.delete(`/api/admin/pins/${id}`);
      fetchPins();
    } catch {
      // ignore
    }
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-fog">Pins</h1>
        <p className="mt-1 text-sm text-muted">Moderate uploaded wallpapers</p>
      </div>

      <form onSubmit={handleSearch} className="flex max-w-md gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-panel/60 px-3">
          <HiMagnifyingGlass size={16} className="text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pins..."
            className="flex-1 bg-transparent py-2.5 text-sm text-fog outline-none placeholder:text-muted"
          />
        </div>
        <button type="submit" className="btn-primary px-4 py-2 text-sm">
          Search
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.pins?.map((pin) => (
            <div
              key={pin._id}
              className={`overflow-hidden rounded-[20px] border glass ${
                pin.userBlocked
                  ? "border-danger/50 opacity-60"
                  : "border-line"
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
                  @{pin.user?.userName} ·{" "}
                  {pin.resolution || `${pin.width}x${pin.height}`}
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
                    className="flex-1 rounded-xl border border-line py-2 text-center text-xs font-medium text-fog hover:bg-panel-hover"
                  >
                    View on site
                  </a>
                  <button
                    onClick={() => handleDelete(pin._id)}
                    className="rounded-xl border border-danger/30 px-3 py-2 text-danger hover:bg-danger/10"
                  >
                    <HiTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-xl border border-line px-4 py-2 text-sm text-muted disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-muted">
            Page {page} of {data.pages}
          </span>
          <button
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl border border-line px-4 py-2 text-sm text-muted disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default PinsPage;
