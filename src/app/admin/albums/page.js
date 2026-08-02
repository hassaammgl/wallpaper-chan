"use client";

import { useEffect, useState } from "react";
import apiRequest from "@/lib/apiRequest";
import EditAlbumModal from "@/components/admin/EditAlbumModal";
import AlbumsTable from "@/components/admin/AlbumsTable";
import { HiMagnifyingGlass, HiPlus } from "react-icons/hi2";

function AlbumsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // null | 'create' | album object

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (query) params.set("search", query);
      const res = await apiRequest.get(`/api/admin/albums?${params}`);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load albums");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, [page, query]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(search);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Delete this album? Wallpapers in it will become uncategorized."
      )
    ) {
      return;
    }
    try {
      await apiRequest.delete(`/api/admin/albums/${id}`);
      fetchAlbums();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete album");
    }
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-fog">Albums</h1>
          <p className="mt-1 text-sm text-muted">
            Create and manage wallpaper albums
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal("create")}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm"
        >
          <HiPlus size={16} />
          Create album
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSearch} className="flex max-w-md gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-panel/60 px-3">
          <HiMagnifyingGlass size={16} className="text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search albums..."
            className="flex-1 bg-transparent py-2.5 text-sm text-fog outline-none placeholder:text-muted"
          />
        </div>
        <button type="submit" className="btn-primary px-4 py-2 text-sm">
          Search
        </button>
      </form>

      <AlbumsTable
        albums={data?.albums}
        loading={loading}
        page={page}
        pages={data?.pages || 0}
        onPageChange={setPage}
        onEdit={setModal}
        onDelete={handleDelete}
        onCreate={() => setModal("create")}
      />

      {modal && (
        <EditAlbumModal
          album={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => fetchAlbums()}
        />
      )}
    </div>
  );
}

export default AlbumsPage;
