import GalleryItem from '../galleryitems/galleryItems'
import { useInfiniteQuery } from '@tanstack/react-query'
import InfiniteScroll from "react-infinite-scroll-component"
import apiRequest from "../../utils/apiRequest"

const fetchPins = async ({ pageParam, search, userId, boardId, deviceType }) => {
  const res = await apiRequest.get('/pins', {
    params: {
      cursor: pageParam || 0,
      search: search || undefined,
      userId: userId || undefined,
      boardId: boardId || undefined,
      deviceType: deviceType || undefined,
    },
  })
  return res.data
}

function PinSkeleton() {
  return (
    <div className="rounded-[20px] bg-panel ring-1 ring-line animate-pulse" style={{ gridRowEnd: 'span 25', minHeight: 200 }} />
  )
}

function Gallery({ search, userId, boardId, deviceType }) {
  const { data, fetchNextPage, hasNextPage, status } = useInfiniteQuery({
    queryKey: ['pins', search, userId, boardId, deviceType],
    queryFn: ({ pageParam = 0 }) => fetchPins({ pageParam, search, userId, boardId, deviceType }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  if (status === "pending") {
    return (
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 auto-rows-[10px]">
        {Array.from({ length: 12 }).map((_, i) => <PinSkeleton key={i} />)}
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] border border-line glass py-20 text-center">
        <p className="text-lg font-medium text-fog">Couldn't load wallpapers</p>
        <p className="text-sm text-muted">Check your connection and try again</p>
      </div>
    )
  }

  const allPins = data?.pages.flatMap(page => page.pins) || []

  if (allPins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] border border-line glass py-20 text-center">
        <p className="text-lg font-medium text-fog">No wallpapers found</p>
        <p className="text-sm text-muted">Try a different search or check back later</p>
      </div>
    )
  }

  return (
    <InfiniteScroll
      dataLength={allPins.length}
      next={fetchNextPage}
      hasMore={!!hasNextPage}
      loader={
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
        </div>
      }
      endMessage={
        <p className="py-8 text-center text-sm text-muted">You've seen it all ✨</p>
      }
    >
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 auto-rows-[10px]">
        {allPins.map(item => (
          <GalleryItem key={item._id} item={item} />
        ))}
      </div>
    </InfiniteScroll>
  )
}

export default Gallery
