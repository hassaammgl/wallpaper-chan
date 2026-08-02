export function PinSkeleton() {
  return (
    <div className="aspect-3/4 animate-pulse rounded-2xl bg-panel ring-1 ring-line" />
  );
}

export function GalleryLoadingState() {
  return (
    <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="mb-3 break-inside-avoid">
          <PinSkeleton />
        </div>
      ))}
    </div>
  );
}

export function GalleryErrorState({ error }) {
  return (
    <div className="rounded-2xl border border-line bg-panel/40 py-16 text-center">
      <p className="font-medium text-fog">Couldn&apos;t load wallpapers</p>
      <p className="mt-1 text-sm text-muted">{error}</p>
    </div>
  );
}

export function GalleryEmptyState() {
  return (
    <div className="rounded-2xl border border-line bg-panel/40 py-16 text-center">
      <p className="font-medium text-fog">No wallpapers found</p>
      <p className="mt-1 text-sm text-muted">
        Try a different filter or check back later
      </p>
    </div>
  );
}
