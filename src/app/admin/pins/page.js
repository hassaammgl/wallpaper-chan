"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import apiRequest from "@/lib/apiRequest";
import EditPinModal from "@/components/admin/EditPinModal";
import PinsTable from "@/components/admin/PinsTable";
import { HiMagnifyingGlass, HiPlus } from "react-icons/hi2";

function PinsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [actionError, setActionError] = useState("");

  const fetchPins = async () => {
    try {
      setLoading(true);
      setActionError("");
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (query) params.set("search", query);
      const res = await apiRequest.get(`/api/admin/pins?${params}`);
      setData(res.data.data);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to load pins");
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
    if (!confirm("Delete this wallpaper permanently?")) return;
    try {
      await apiRequest.delete(`/api/admin/pins/${id}`);
      fetchPins();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to delete pin");
    }
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-fog">Pins</h1>
          <p className="mt-1 text-sm text-muted">
            Edit, delete, and moderate wallpapers
          </p>
        </div>
        <Link
          href="/create"
          className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm"
        >
          <HiPlus size={16} />
          Upload wallpaper
        </Link>
      </div>

      {actionError && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {actionError}
        </div>
      )}

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

      <PinsTable
        pins={data?.pins}
        loading={loading}
        page={page}
        pages={data?.pages || 0}
        onPageChange={setPage}
        onEdit={setEditing}
        onDelete={handleDelete}
      />

      {editing && (
        <EditPinModal
          pin={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setData((prev) =>
              prev
                ? {
                    ...prev,
                    pins: prev.pins.map((p) =>
                      p._id === updated._id ? { ...p, ...updated } : p
                    ),
                  }
                : prev
            );
          }}
        />
      )}
    </div>
  );
}

export default PinsPage;
