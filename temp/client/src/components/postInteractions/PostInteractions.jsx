import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import apiRequest from "../../utils/apiRequest"
import { HiShare, HiEllipsisHorizontal, HiHeart } from 'react-icons/hi2'

const interact = async (id, type) => {
  const res = await apiRequest.post(`/pins/interact/${id}`, { type })
  return res.data
}

function PostInteractions({ postId }) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({ id, type }) => interact(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interactionCheck", postId] })
    }
  })

  const { isPending, error, data } = useQuery({
    queryKey: ["interactionCheck", postId],
    queryFn: () =>
      apiRequest.get(`/pins/interaction-check/${postId}`)
        .then((res) => res.data)
        .catch(() => ({ likeCount: 0, isLiked: false, isSaved: false }))
  })

  if (isPending || error) return null

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => mutation.mutate({ id: postId, type: "like" })}
          className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all ${
            data.isLiked
              ? 'bg-parrot/15 text-parrot'
              : 'text-muted hover:bg-panel-hover hover:text-fog'
          }`}
        >
          <HiHeart size={20} className={data.isLiked ? 'fill-current' : ''} />
          {data.likeCount}
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-panel-hover hover:text-fog">
          <HiShare size={18} />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-panel-hover hover:text-fog">
          <HiEllipsisHorizontal size={18} />
        </button>
      </div>

      <button
        disabled={mutation.isPending}
        onClick={() => mutation.mutate({ id: postId, type: "save" })}
        className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 ${
          data.isSaved
            ? 'border border-accent/40 bg-accent-soft text-accent'
            : 'btn-primary'
        }`}
      >
        {data.isSaved ? "Saved" : "Save"}
      </button>
    </div>
  )
}

export default PostInteractions
