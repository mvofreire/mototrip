'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Star, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn, formatRating } from '@/lib/utils'
import { useRouteView } from './route-view-context'

/**
 * Phones: map on top, details in a sheet that overlaps it.
 * Desktop: map fixed on the left, a 600px details panel on the right that can
 * fold away ("Full screen").
 */
export function RouteSplit({ map, panel }: { map: ReactNode; panel: ReactNode }) {
  const { expanded } = useRouteView()
  return (
    <div
      className={cn(
        'lg:grid lg:items-stretch lg:transition-[grid-template-columns] lg:duration-500 lg:ease-out',
        expanded ? 'lg:grid-cols-[minmax(0,1fr)_0px]' : 'lg:grid-cols-[minmax(0,1fr)_600px]',
      )}
    >
      <div className="relative">{map}</div>
      <div
        className={cn(
          'relative z-[5] -mt-7 min-w-0 rounded-t-[22px] border-t bg-card px-4 pb-8 pt-2.5 animate-in fade-in slide-in-from-bottom-6 duration-500 lg:mt-0 lg:rounded-none lg:border-l lg:border-t-0 lg:px-10 lg:pt-7 lg:slide-in-from-bottom-0 lg:slide-in-from-right-6',
          expanded && 'lg:invisible lg:overflow-hidden',
        )}
      >
        <div className="mx-auto mb-3.5 h-1 w-10 rounded-full bg-border lg:hidden" aria-hidden />
        {panel}
      </div>
    </div>
  )
}

/** "★ 4.6 · MotoTrip" and "★ 4.8 (32)": each opens the tab with the full review */
export function RatingChips({
  curator,
  community,
  count,
}: {
  curator: number | null
  community: number | null
  count: number
}) {
  const t = useTranslations('route')
  const { goToTab } = useRouteView()
  return (
    <>
      {curator != null && (
        <button
          type="button"
          onClick={() => goToTab('about')}
          aria-label={t('curatorChip', { rating: formatRating(curator) })}
          className="inline-flex h-7 items-center gap-1 rounded-full bg-gradient-brand px-3 text-xs font-bold transition-transform active:scale-95"
        >
          <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
          {formatRating(curator)}
          <span className="font-medium opacity-85">· MotoTrip</span>
        </button>
      )}
      {community != null && count > 0 && (
        <button
          type="button"
          onClick={() => goToTab('reviews')}
          aria-label={t('communityChip', { rating: formatRating(community), count })}
          className="inline-flex h-7 items-center gap-1 rounded-full bg-muted px-3 text-xs font-semibold transition-transform active:scale-95"
        >
          <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
          {formatRating(community)} ({count})
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        </button>
      )}
    </>
  )
}

/**
 * Phones: GPX + Google Maps bar pinned to the bottom, shown once the main
 * buttons have scrolled out of view.
 */
export function MobileActionBar({ watchId, children }: { watchId: string; children: ReactNode }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = document.getElementById(watchId)
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0))
    io.observe(el)
    return () => io.disconnect()
  }, [watchId])

  return (
    <div
      className={cn(
        'sticky bottom-0 z-30 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2.5 border-t bg-background/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2.5 backdrop-blur transition-[transform,opacity] duration-300 lg:hidden',
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0',
      )}
    >
      {children}
    </div>
  )
}
