import { useQuery } from "@tanstack/react-query"
import apiRequest from "../../utils/apiRequest"
import Comment from "./comment.jsx"
import CommentForm from "./commentForm.jsx"

function Comments({ id }) {
  const { isPending, error, data } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => apiRequest.get(`/comments/${id}`).then((res) => res.data)
  })

  if (isPending) {
    return (
      <div className="flex flex-1 flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-xl bg-panel" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 rounded bg-panel" />
              <div className="h-3 w-full rounded bg-panel" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  if (error) return <p className="text-sm text-danger">Failed to load comments</p>

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
        <span className="text-xs font-medium uppercase tracking-wider text-muted">
          {data.length === 0 ? "No comments yet" : `${data.length} comment${data.length > 1 ? 's' : ''}`}
        </span>
        {data.map((comment) => (
          <Comment key={comment._id} comment={comment} pinId={id} />
        ))}
      </div>
      <CommentForm id={id} />
    </div>
  )
}

export default Comments
