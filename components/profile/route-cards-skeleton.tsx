/** Placeholder with the route card grid's shape, so the list arriving doesn't move the page */
export function RouteCardsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-2">
          <div className="overflow-hidden rounded-lg border bg-card">
            <div className="aspect-[16/9] animate-pulse bg-muted" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="h-9 animate-pulse rounded-md bg-muted/60" />
        </div>
      ))}
    </div>
  )
}
