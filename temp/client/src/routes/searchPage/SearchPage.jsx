import Gallery from '../../components/gallery/gallery'
import { useSearchParams } from 'react-router'
import { HiMagnifyingGlass, HiRectangleStack } from 'react-icons/hi2'

function SearchPage() {
  const [searchParams] = useSearchParams()
  const search = searchParams.get("search")
  const boardId = searchParams.get("boardId")

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        {boardId ? (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <HiRectangleStack size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-fog">Board collection</h1>
              <p className="text-sm text-muted">Browsing saved pins in this board</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <HiMagnifyingGlass size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-fog">
                {search ? (
                  <>Results for <span className="text-gradient">"{search}"</span></>
                ) : (
                  'Search'
                )}
              </h1>
              <p className="text-sm text-muted">Find wallpapers by title or tags</p>
            </div>
          </>
        )}
      </div>
      <Gallery search={search} boardId={boardId} />
    </div>
  )
}

export default SearchPage
