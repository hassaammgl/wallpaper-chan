"use client";

import Image from "@/components/Image/Image";
import AdminPagination from "@/components/admin/AdminPagination";
import { format } from "timeago.js";
import { HiTrash, HiNoSymbol, HiCheckCircle } from "react-icons/hi2";

function UsersTable({
  users,
  loading,
  page,
  pages,
  onPageChange,
  onUpdateRole,
  onToggleBlock,
  onDelete,
}) {
  return (
    <>
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
              users?.map((user) => (
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
                        <p className="font-medium text-fog">{user.displayName}</p>
                        <p className="text-xs text-muted">@{user.userName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => onUpdateRole(user._id, e.target.value)}
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
                        onClick={() => onToggleBlock(user._id, user.blocked)}
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
                        onClick={() => onDelete(user._id)}
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

      <AdminPagination page={page} pages={pages} onPageChange={onPageChange} />
    </>
  );
}

export default UsersTable;
