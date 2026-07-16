"use client";

import { useState, useEffect } from "react";
import Image from "@/components/Image/Image";
import apiRequest from "@/lib/apiRequest";
import { format } from "timeago.js";
import {
  HiMagnifyingGlass,
  HiTrash,
  HiNoSymbol,
  HiCheckCircle,
} from "react-icons/hi2";

function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
      });
      if (query) params.set("search", query);
      const res = await apiRequest.get(`/api/admin/users?${params}`);
      setData(res.data.data);
    } catch {
      // ignore
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
    } catch {
      // ignore
    }
  };

  const handleToggleBlock = async (id, blocked) => {
    const action = blocked ? "unblock" : "block";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      await apiRequest.patch(`/api/admin/users/${id}`, { blocked: !blocked });
      fetchUsers();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user? All their data will be removed.")) return;
    try {
      await apiRequest.delete(`/api/admin/users/${id}`);
      fetchUsers();
    } catch {
      // ignore
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

      <div className="overflow-x-auto rounded-[20px] border border-line glass">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-panel/80 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  Loading...
                </td>
              </tr>
            ) : (
              data?.users?.map((user) => (
                <tr
                  key={user._id}
                  className={`border-b border-line/50 hover:bg-panel/40 ${
                    user.blocked ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        path={user.img || "/general/noAvatar.svg"}
                        alt={user.displayName || user.userName || "User avatar"}
                        w={32}
                        h={32}
                        className="h-8 w-8 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-fog">
                          {user.displayName}
                        </p>
                        <p className="text-xs text-muted">@{user.userName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleUpdateRole(user._id, e.target.value)
                      }
                      className="rounded-lg border border-line bg-canvas px-2 py-1 text-xs text-fog outline-none"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {user.blocked ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-danger">
                        <HiNoSymbol size={10} />
                        Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-parrot/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-parrot">
                        <HiCheckCircle size={10} />
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {format(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() =>
                          handleToggleBlock(user._id, user.blocked)
                        }
                        title={user.blocked ? "Unblock user" : "Block user"}
                        className={`rounded-lg p-2 transition-colors ${
                          user.blocked
                            ? "text-parrot hover:bg-parrot/10"
                            : "text-muted hover:bg-danger/10 hover:text-danger"
                        }`}
                      >
                        <HiNoSymbol size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="rounded-lg p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                      >
                        <HiTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

export default UsersPage;
