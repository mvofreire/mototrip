'use client'

import Image from 'next/image'
import { useEffect, useState, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Maximize2, Minimize2, Navigation, X } from 'lucide-react'
import { googleMapsStopUrl, type LatLng } from '@/lib/route-export'
import { trackEvent } from '@/lib/analytics'
import type { RouteStop } from '@/types'
import { cn } from '@/lib/utils'
import { scrollToTop } from '@/lib/scroll'
import { useRouteView } from './route-view-context'
import { RouteLiveMap } from './route-live-map'

type Props = {
  title: string
  routeSlug: string
  /** Pre-rendered static map of the route (700×400 PNG): the page's LCP image */
  thumbnailUrl: string | null
  coords: LatLng[]
  stops: RouteStop[]
  /** Floating buttons over the map on phones (save, share) */
  mobileActions?: ReactNode
  /** Download / open buttons shown at the bottom of the full-screen map */
  fullscreenActions?: ReactNode
}

/**
 * Top of the route page. The first paint is a plain image (fast LCP, no
 * Leaflet). The live map is mounted on demand: tapping it on a phone opens
 * it full screen; on desktop it replaces the image once the browser is idle.
 */
export function RouteMapHero({ title, routeSlug, thumbnailUrl, coords, stops, mobileActions, fullscreenActions }: Props) {
  const t = useTranslations('route')
  const { mapOpen, setMapOpen, expanded, setExpanded, activeStop, setActiveStop } = useRouteView()
  const [desktopLive, setDesktopLive] = useState(false)
  const hasMap = coords.length > 1 || stops.length > 0

  // Desktop: the map is the main view, so load it once the page is idle
  useEffect(() => {
    if (!hasMap) return
    const mq = window.matchMedia('(min-width: 1024px)')
    let handle: number | undefined
    const start = () => {
      if (!mq.matches) return
      const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback
      handle = idle ? idle(() => setDesktopLive(true)) : window.setTimeout(() => setDesktopLive(true), 1200)
    }
    start()
    mq.addEventListener('change', start)
    return () => {
      mq.removeEventListener('change', start)
      if (handle) window.clearTimeout(handle)
    }
  }, [hasMap])

  // Full-screen map on phones: lock the page behind it, Esc closes
  useEffect(() => {
    if (!mapOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMapOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [mapOpen, setMapOpen])

  return (
    <div className="relative h-[min(58svh,440px)] min-h-[300px] overflow-hidden bg-muted lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:min-h-[560px]">
      {thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt={t('mapAlt', { title })}
          fill
          priority
          sizes="(min-width: 1024px) calc(100vw - 600px), 100vw"
          className="route-static-map object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-steel-300 via-steel-200 to-brand-100 dark:from-steel-900 dark:via-steel-800 dark:to-brand-950" />
      )}

      {/* Desktop live map, over the image once loaded */}
      {desktopLive && (
        <div className="absolute inset-0 hidden animate-in fade-in duration-700 lg:block">
          <RouteLiveMap coords={coords} stops={stops} />
        </div>
      )}

      {/* Phones: the whole image opens the live map */}
      {hasMap && (
        <button
          type="button"
          onClick={() => setMapOpen(true)}
          aria-label={t('openFullscreenMap')}
          className="absolute inset-0 z-[1] lg:hidden"
        />
      )}
      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-background/70 via-transparent via-25% to-background/90 lg:hidden" />

      {mobileActions && (
        <div className="absolute right-3 top-3 z-[3] flex gap-2 lg:hidden">{mobileActions}</div>
      )}

      {hasMap && (
        <>
          <button
            type="button"
            onClick={() => setMapOpen(true)}
            className="absolute bottom-11 right-3 z-[3] inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-bold text-background shadow-lg transition-transform active:scale-95 lg:hidden"
          >
            <Maximize2 className="h-4 w-4" aria-hidden />
            {t('fullscreen')}
          </button>
          <button
            type="button"
            onClick={() => {
              setExpanded(!expanded)
              // The page height changes with the panel: start again from the map / the panel top
              scrollToTop()
            }}
            aria-pressed={expanded}
            className="absolute right-5 top-5 z-[500] hidden h-11 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-bold text-background shadow-lg transition-transform active:scale-95 lg:inline-flex"
          >
            {expanded ? <Minimize2 className="h-4 w-4" aria-hidden /> : <Maximize2 className="h-4 w-4" aria-hidden />}
            {expanded ? t('showDetails') : t('fullscreen')}
          </button>
        </>
      )}

      {/* Phones: full-screen live map */}
      {mapOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('routeMap')}
          className="fixed inset-0 z-[60] flex flex-col bg-background animate-in fade-in zoom-in-95 duration-300 lg:hidden"
        >
          <div className="relative flex-1">
            <RouteLiveMap coords={coords} stops={stops} />
            <div className="absolute inset-x-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[500] flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMapOpen(false)}
                aria-label={t('closeMap')}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background shadow-lg"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
              <div className="flex h-11 min-w-0 flex-1 items-center rounded-full bg-background/90 px-4 text-sm font-bold shadow-lg backdrop-blur">
                <span className="truncate">{title}</span>
              </div>
            </div>
          </div>
          <div className="border-t bg-background pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
            {stops.length > 0 && (
              <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-3 pt-3 [scrollbar-width:none]">
                {stops.map((stop, i) => (
                  <div
                    key={stop.id}
                    ref={(el) => {
                      if (el && stop.id === activeStop) el.scrollIntoView({ inline: 'center', block: 'nearest' })
                    }}
                    onClick={() => setActiveStop(stop.id)}
                    className={cn(
                      'flex w-64 shrink-0 snap-start items-center gap-3 rounded-xl border bg-card p-3 transition-colors',
                      stop.id === activeStop && 'border-primary',
                    )}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-steel-800 text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{stop.name}</span>
                    <a
                      href={googleMapsStopUrl({ lat: Number(stop.latitude), lng: Number(stop.longitude) })}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t('navigateTo', { name: stop.name })}
                      onClick={() => trackEvent('google_maps_open', { route: routeSlug, from: 'stop' })}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                    >
                      <Navigation className="h-4 w-4" aria-hidden />
                    </a>
                  </div>
                ))}
              </div>
            )}
            {fullscreenActions && <div className={cn('grid grid-cols-[7rem_minmax(0,1fr)] gap-2.5 px-3 pt-3')}>{fullscreenActions}</div>}
          </div>
        </div>
      )}
    </div>
  )
}
