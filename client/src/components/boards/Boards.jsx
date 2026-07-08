import Image from '../Image/Image'
import { useQuery } from '@tanstack/react-query'
import apiRequest from '../../utils/apiRequest'
import { format } from "timeago.js"
import { Link } from 'react-router'
import { HiRectangleStack } from 'react-icons/hi2'

function Boards({ userId }) {
  const { isPending, error, data } = useQuery({
    queryKey: ["boards", userId],
    queryFn: () => apiRequest.get(`/boards/${userId}`).then((res) => res.data)
  })

  if (isPending) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse space-y-3">
            <div className="aspect-[3/4] rounded-[20px] bg-panel" />
            <div className="h-4 w-2/3 rounded bg-panel" />
          </div>
        ))}
      </div>
    )
  }
  if (error) return <p className="text-danger">Failed to load boards</p>

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[28px] border border-line glass py-16 text-center">
        <HiRectangleStack size={32} className="text-muted" />
        <p className="text-fog font-medium">No boards yet</p>
        <p className="text-sm text-muted">Saved collections will appear here</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {data.map((board) => (
        <Link
          to={`/search?boardId=${board._id}`}
          key={board._id}
          className="group space-y-3"
        >
          <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] ring-1 ring-line transition-all group-hover:-translate-y-1 group-hover:ring-accent/30 group-hover:shadow-xl group-hover:shadow-accent/10">
            {board.firstPin?.media ? (
              <Image
                src={board.firstPin.media}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-panel">
                <HiRectangleStack size={32} className="text-muted" />
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-ink/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div>
            <h3 className="truncate text-sm font-semibold text-fog">{board.title}</h3>
            <span className="text-xs text-muted">{board.pinCount} pins · {format(board.createdAt)}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default Boards
