import Image from '../Image/Image'
import { format } from 'timeago.js'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiRequest from '../../utils/apiRequest'
import { HiTrash } from 'react-icons/hi2'

function Comment({ comment, pinId }) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id) => apiRequest.delete(`/comments/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", pinId] })
    }
  })

  return (
    <div className="group flex items-start justify-between gap-2">
      <div className="flex flex-1 gap-3">
        <Image
          path={comment.user.img || "/general/noAvatar.png"}
          alt=""
          className="h-8 w-8 shrink-0 rounded-xl object-cover ring-1 ring-line"
        />
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-fog">{comment.user.displayName}</span>
          <p className="text-sm text-muted leading-relaxed">{comment.description}</p>
          <span className="text-[11px] text-muted/70">{format(comment.createdAt.trim())}</span>
        </div>
      </div>
      <button
        onClick={() => mutation.mutate(comment._id)}
        className="rounded-lg p-1.5 text-muted opacity-0 transition-all hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
      >
        <HiTrash size={14} />
      </button>
    </div>
  )
}

export default Comment
