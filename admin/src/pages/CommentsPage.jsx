import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiRequest from '../utils/apiRequest'
import Image from '../components/Image'
import { format } from 'timeago.js'
import { HiTrash } from 'react-icons/hi2'

function CommentsPage() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()
  const clientUrl = import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173'

  const { data, isPending, error } = useQuery({
    queryKey: ['admin', 'comments', page],
    queryFn: () =>
      apiRequest.get('/api/admin/comments', { params: { page, limit: 20 } })
        .then((res) => res.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => apiRequest.delete(`/api/admin/comments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'comments'] }),
  })

  if (error) return <p className="text-danger">Error: {error.message}</p>

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-fog">Comments</h1>
        <p className="mt-1 text-sm text-muted">Moderate user comments</p>
      </div>

      <div className="space-y-3">
        {isPending ? (
          <p className="py-8 text-center text-muted">Loading...</p>
        ) : data?.comments?.length === 0 ? (
          <p className="py-8 text-center text-muted">No comments yet</p>
        ) : data?.comments?.map((comment) => (
          <div key={comment._id} className="flex items-start gap-4 rounded-[20px] border border-line glass p-4">
            <Image path={comment.user?.img || '/general/noAvatar.png'} className="h-10 w-10 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-fog">{comment.user?.displayName}</p>
                <span className="text-xs text-muted">@{comment.user?.userName}</span>
                <span className="text-xs text-muted">· {format(comment.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted">{comment.description}</p>
              <a
                href={`${clientUrl}/pins/${comment.pin}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-xs text-accent hover:underline"
              >
                View pin →
              </a>
            </div>
            <button
              onClick={() => {
                if (confirm('Delete this comment?')) deleteMutation.mutate(comment._id)
              }}
              disabled={deleteMutation.isPending}
              className="rounded-lg p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
            >
              <HiTrash size={16} />
            </button>
          </div>
        ))}
      </div>

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

export default CommentsPage
