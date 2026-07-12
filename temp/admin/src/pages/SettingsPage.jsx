import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiRequest from '../utils/apiRequest'
import { HiCloud, HiPhoto } from 'react-icons/hi2'

function SettingsPage() {
  const queryClient = useQueryClient()

  const { data, isPending, error } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => apiRequest.get('/api/admin/settings').then((res) => res.data.data),
  })

  const mutation = useMutation({
    mutationFn: (uploadProvider) =>
      apiRequest.patch('/api/admin/settings', { uploadProvider }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] }),
  })

  if (isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    )
  }

  if (error) return <p className="text-danger">Error: {error.message}</p>

  const providers = [
    {
      id: 'imagekit',
      name: 'ImageKit',
      desc: 'Fast CDN with URL-based transforms. Display uses light compression; download serves original raw file.',
      icon: HiPhoto,
    },
    {
      id: 'cloudinary',
      name: 'Cloudinary',
      desc: 'Cloud media platform. Upload stores original quality; site preview uses optimized delivery only.',
      icon: HiCloud,
    },
  ]

  return (
    <div className="animate-fade-up mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-fog">Upload Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Choose which CDN handles new wallpaper uploads site-wide
        </p>
      </div>

      <div className="space-y-4">
        {providers.map(({ id, name, desc, icon: Icon }) => (
          <button
            key={id}
            onClick={() => mutation.mutate(id)}
            disabled={mutation.isPending}
            className={`w-full rounded-[20px] border p-5 text-left transition-all ${
              data.uploadProvider === id
                ? 'border-accent bg-accent-soft glow-ring'
                : 'border-line glass hover:border-accent/30'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                data.uploadProvider === id ? 'bg-accent text-ink' : 'bg-panel text-muted'
              }`}>
                <Icon size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-fog">{name}</h3>
                  {data.uploadProvider === id && (
                    <span className="rounded-full bg-parrot px-2 py-0.5 text-[10px] font-bold uppercase text-ink">
                      Active
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">{desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-[20px] border border-line glass p-5 text-sm text-muted">
        <p className="font-medium text-fog">How it works</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Uploads are stored at <strong className="text-fog">100% original quality</strong></li>
          <li>Site gallery uses light web optimization for fast loading</li>
          <li>Download button always serves the <strong className="text-fog">full HD original</strong></li>
          <li>Changing provider only affects <em>new</em> uploads</li>
        </ul>
      </div>
    </div>
  )
}

export default SettingsPage
