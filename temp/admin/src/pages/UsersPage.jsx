import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiRequest from '../utils/apiRequest'
import Image from '../components/Image'
import { format } from 'timeago.js'
import { HiMagnifyingGlass, HiTrash } from 'react-icons/hi2'

function UsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const queryClient = useQueryClient()

  const { data, isPending, error } = useQuery({
    queryKey: ['admin', 'users', page, query],
    queryFn: () =>
      apiRequest.get('/api/admin/users', { params: { page, limit: 15, search: query || undefined } })
        .then((res) => res.data.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, role }) => apiRequest.patch(`/api/admin/users/${id}`, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => apiRequest.delete(`/api/admin/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setQuery(search)
    setPage(1)
  }

  if (error) return <p className="text-danger">Error: {error.message}</p>

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
        <button type="submit" className="btn-primary px-4 py-2 text-sm">Search</button>
      </form>

      <div className="overflow-x-auto rounded-[20px] border border-line glass">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line bg-panel/80 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isPending ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">Loading...</td></tr>
            ) : data?.users?.map((user) => (
              <tr key={user._id} className="border-b border-line/50 hover:bg-panel/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Image path={user.img || '/general/noAvatar.png'} className="h-8 w-8 rounded-lg object-cover" />
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
                    onChange={(e) => updateMutation.mutate({ id: user._id, role: e.target.value })}
                    disabled={updateMutation.isPending}
                    className="rounded-lg border border-line bg-canvas px-2 py-1 text-xs text-fog outline-none"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-muted">{format(user.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${user.userName}? All their data will be removed.`)) {
                        deleteMutation.mutate(user._id)
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                  >
                    <HiTrash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.pages > 1 && (
        <Pagination page={page} pages={data.pages} onChange={setPage} />
      )}
    </div>
  )
}

function Pagination({ page, pages, onChange }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}
        className="rounded-xl border border-line px-4 py-2 text-sm text-muted disabled:opacity-40">Previous</button>
      <span className="text-sm text-muted">Page {page} of {pages}</span>
      <button disabled={page >= pages} onClick={() => onChange(page + 1)}
        className="rounded-xl border border-line px-4 py-2 text-sm text-muted disabled:opacity-40">Next</button>
    </div>
  )
}

export default UsersPage
