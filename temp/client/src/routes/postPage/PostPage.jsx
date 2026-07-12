import Image from '../../components/Image/Image'
import PostInteractions from '../../components/postInteractions/PostInteractions'
import Comments from '../../components/comments/Comments'
import { Link, useParams, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import apiRequest from '../../utils/apiRequest'
import { HiArrowLeft, HiArrowDownTray, HiDevicePhoneMobile, HiComputerDesktop } from 'react-icons/hi2'

function PostPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { isPending, error, data } = useQuery({
    queryKey: ["pin", id],
    queryFn: () => apiRequest.get(`/pins/${id}`).then((res) => res.data)
  })

  const handleDownload = async () => {
    try {
      const res = await apiRequest.get(`/pins/${id}/download`)
      const { downloadUrl, filename } = res.data
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = filename || "wallpaper.jpg"
      link.target = "_blank"
      link.rel = "noopener noreferrer"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      alert("Download failed. Please try again.")
    }
  }

  if (isPending) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    )
  }
  if (error) return <p className="text-center text-danger py-12">Error: {error.message}</p>
  if (!data) return <p className="text-center text-muted py-12">Pin not found</p>

  const DeviceIcon = data.deviceType === "mobile" ? HiDevicePhoneMobile : HiComputerDesktop

  return (
    <div className="animate-fade-up">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 rounded-full border border-line bg-panel/60 px-4 py-2 text-sm text-muted transition-all hover:border-accent/30 hover:text-fog"
      >
        <HiArrowLeft size={16} />
        Back
      </button>

      <div className="flex flex-col overflow-hidden rounded-[28px] border border-line glass lg:flex-row lg:max-h-[calc(100vh-180px)]">
        <div className="relative flex flex-1 items-center justify-center bg-canvas/80 p-4 lg:min-h-[400px]">
          <Image
            pin={data}
            path={data.media}
            uploadProvider={data.uploadProvider}
            mode="display"
            alt={data.title || ''}
            w={1200}
            className="max-h-[70vh] max-w-full rounded-2xl object-contain shadow-2xl shadow-black/40 lg:max-h-full"
          />
        </div>

        <div className="flex w-full flex-col gap-5 border-t border-line p-5 lg:w-[400px] lg:shrink-0 lg:border-t-0 lg:border-l">
          <PostInteractions postId={id} />

          <button
            onClick={handleDownload}
            className="btn-primary flex w-full items-center justify-center gap-2 py-3 text-sm"
          >
            <HiArrowDownTray size={18} />
            Download Full HD ({data.resolution || `${data.width}×${data.height}`})
          </button>

          <div className="flex flex-wrap gap-2 text-xs">
            {data.deviceType && (
              <span className="flex items-center gap-1 rounded-full border border-line bg-panel/60 px-3 py-1 text-muted">
                <DeviceIcon size={14} />
                {data.deviceType}
              </span>
            )}
            {data.category && (
              <span className="rounded-full border border-line bg-panel/60 px-3 py-1 capitalize text-muted">
                {data.category}
              </span>
            )}
            {data.uploadProvider && (
              <span className="rounded-full border border-line bg-panel/60 px-3 py-1 text-muted">
                {data.uploadProvider}
              </span>
            )}
          </div>

          {data?.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {data.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/search?search=${tag}`}
                  className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs text-accent hover:opacity-80"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {data?.user ? (
            <Link
              to={`/${data.user.userName}`}
              className="flex items-center gap-3 rounded-2xl border border-line bg-panel/50 p-3 transition-colors hover:bg-panel-hover"
            >
              <Image
                path={data.user.img || "/general/noAvatar.png"}
                className="h-10 w-10 rounded-xl object-cover ring-2 ring-accent/15"
              />
              <div>
                <span className="block text-sm font-semibold text-fog">{data.user.displayName}</span>
                <span className="text-xs text-muted">@{data.user.userName}</span>
              </div>
            </Link>
          ) : null}

          {(data.title || data.description) && (
            <div className="space-y-1">
              {data.title && <h2 className="text-lg font-semibold text-fog">{data.title}</h2>}
              {data.description && <p className="text-sm text-muted leading-relaxed">{data.description}</p>}
            </div>
          )}

          <Comments id={data._id} />
        </div>
      </div>
    </div>
  )
}

export default PostPage
