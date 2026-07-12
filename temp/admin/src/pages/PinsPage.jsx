import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiRequest from '../utils/apiRequest'
import Image from '../components/Image'
import { format } from 'timeago.js'
import { HiMagnifyingGlass, HiTrash } from 'react-icons/hi2'

function PinsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const queryClient = useQueryClient()
  const clientUrl = import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173'

  const { data, isPending, error } = useQuery({
    queryKey: ['admin', 'pins', page, query],
    queryFn: () =>
      apiRequest.get('/api/admin/pins', { params: { page, limit: 12, search: query || undefined } })
        .then((res) => res.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => apiRequest.delete(`/api/admin/pins/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'pins'] }),
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
        <button type="submit" className="btn-primary px-4 py-2 text-sm">Search</button>
      </form>

      {isPending ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.pins?.map((pin) => (
            <div key={pin._id} className="overflow-hidden rounded-[20px] border border-line glass">
              <Image path={pin.media} pin={pin} className="aspect-video w-full object-cover" />
              <div className="space-y-2 p-4">
                <h3 className="truncate font-semibold text-fog">{pin.title}</h3>
                <p className="truncate text-xs text-muted">
                  @{pin.user?.userName} · {pin.resolution || `${pin.width}×${pin.height}`}
                </p>
                <div className="flex flex-wrap gap-1">
                  {pin.deviceType && (
                    <span className="rounded-full bg-panel px-2 py-0.5 text-[10px] capitalize text-muted">{pin.deviceType}</span>
                  )}
                  {pin.category && (
                    <span className="rounded-full bg-panel px-2 py-0.5 text-[10px] capitalize text-muted">{pin.category}</span>
                  )}
                  {pin.uploadProvider && (
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] text-accent">{pin.uploadProvider}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`${clientUrl}/pins/${pin._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-xl border border-line py-2 text-center text-xs font-medium text-fog hover:bg-panel-hover"
                  >
                    View on site
                  </a>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${pin.title}"?`)) deleteMutation.mutate(pin._id)
                    }}
                    disabled={deleteMutation.isPending}
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
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
            className="rounded-xl border border-line px-4 py-2 text-sm text-muted disabled:opacity-40">Previous</button>
          <span className="text-sm text-muted">Page {page} of {data.pages}</span>
          <button disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}
            className="rounded-xl border border-line px-4 py-2 text-sm text-muted disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  )
}

export default PinsPage
