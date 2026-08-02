"use client";

import { useState, useEffect } from "react";
import apiRequest from "@/lib/apiRequest";
import UsersTable from "@/components/admin/UsersTable";
import { HiMagnifyingGlass } from "react-icons/hi2";

function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setActionError(null);
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
      });
      if (query) params.set("search", query);
      const res = await apiRequest.get(`/api/admin/users?${params}`);
      setData(res.data.data);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, query]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(search);
    setPage(1);
  };

  const handleUpdateRole = async (id, role) => {
    try {
      await apiRequest.patch(`/api/admin/users/${id}`, { role });
      fetchUsers();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleToggleBlock = async (id, blocked) => {
    const action = blocked ? "unblock" : "block";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      await apiRequest.patch(`/api/admin/users/${id}`, { blocked: !blocked });
      fetchUsers();
    } catch (err) {
      setActionError(err.response?.data?.message || `Failed to ${action} user`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user? All their data will be removed.")) return;
    try {
      await apiRequest.delete(`/api/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-fog">Users</h1>
        <p className="mt-1 text-sm text-muted">Manage accounts and roles</p>
      </div>

      <form onSubmit={handleSearch} className="flex max-w-md gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-panel/60 px-3">
          <HiMagnifyingGlass size={16} className="text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="flex-1 bg-transparent py-2.5 text-sm text-fog outline-none placeholder:text-muted"
          />
        </div>
        <button type="submit" className="btn-primary px-4 py-2 text-sm">
          Search
        </button>
      </form>

      {actionError && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {actionError}
        </div>
      )}

      <UsersTable
        users={data?.users}
        loading={loading}
        page={page}
        pages={data?.pages || 0}
        onPageChange={setPage}
        onUpdateRole={handleUpdateRole}
        onToggleBlock={handleToggleBlock}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default UsersPage;
