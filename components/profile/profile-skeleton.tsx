import { RouteCardsSkeleton } from './route-cards-skeleton'

/**
 * The profile's shape while auth and data load: same cover, avatar, name,
 * stats and tabs boxes as ProfileView, so the real page drops in without
 * moving (CLS). min-h-screen keeps the footer below the fold meanwhile.
 */
export function ProfileSkeleton() {
  return (
    <div className="min-h-screen pb-16" aria-busy="true" aria-live="polite">
      <div className="h-32 bg-[radial-gradient(120%_140%_at_85%_0%,hsl(var(--primary)/0.25),transparent_55%),linear-gradient(180deg,hsl(var(--secondary)),hsl(var(--background)))] md:h-48" />

      <div className="container relative -mt-12 flex flex-col gap-3 md:-mt-16 md:flex-row md:items-end md:gap-6">
        <div className="h-24 w-24 shrink-0 animate-pulse rounded-full bg-muted ring-4 ring-background md:h-32 md:w-32" />
        <div className="min-w-0 flex-1">
          <div className="mb-2.5 h-[32px] w-3/4 max-w-sm animate-pulse rounded bg-muted md:h-[46px]" />
          <div className="flex gap-2">
            <div className="h-[22px] w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-[22px] w-40 animate-pulse rounded bg-muted" />
          </div>
          <div className="mt-1.5 h-[19px] w-48 animate-pulse rounded bg-muted" />
        </div>
      </div>

      <div className="container mt-4 md:mt-6">
        <div className="grid h-[86px] grid-cols-3 divide-x overflow-hidden rounded-xl border bg-card md:max-w-xl">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center justify-center gap-2">
              <div className="h-7 w-8 animate-pulse rounded bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 border-b">
        <div className="container flex gap-1 py-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 flex-1 animate-pulse rounded-lg bg-muted/60 md:w-28 md:flex-none" />
          ))}
        </div>
      </div>

      <div className="container pt-5 md:pt-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-40 animate-pulse rounded bg-muted" />
          <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
        </div>
        <RouteCardsSkeleton />
      </div>
    </div>
  )
}
