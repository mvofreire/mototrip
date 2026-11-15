'use client'

import { useTranslations } from 'next-intl'
import { Download, Navigation } from 'lucide-react'
import { buildGpx, gpxFileName, type LatLng } from '@/lib/route-export'
import { trackEvent } from '@/lib/analytics'
import type { RouteStop } from '@/types'
import { cn } from '@/lib/utils'

/** "Open in Google Maps": the whole route, with the track's roads */
export function GoogleMapsRouteLink({
  href,
  routeSlug,
  className,
  children,
}: {
  href: string | null
  routeSlug: string
  className?: string
  children: React.ReactNode
}) {
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('google_maps_open', { route: routeSlug, from: 'route' })}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl bg-primary font-bold text-primary-foreground shadow-[0_10px_24px_-10px_hsl(var(--primary)/0.8)] transition-transform hover:brightness-110 active:scale-[0.98]',
        className,
      )}
    >
      <Navigation className="h-5 w-5 shrink-0" aria-hidden />
      {children}
    </a>
  )
}

/** "Download GPX": the file (track + stops as waypoints) is built in the browser */
export function GpxButton({
  title,
  description,
  coords,
  stops,
  routeSlug,
  className,
  children,
  'aria-label': ariaLabel,
}: {
  title: string
  description: string | null
  coords: LatLng[]
  stops: RouteStop[]
  routeSlug: string
  className?: string
  children: React.ReactNode
  'aria-label'?: string
}) {
  const t = useTranslations('route')
  if (coords.length === 0) return null

  const onClick = () => {
    try {
      const blob = new Blob([buildGpx(coords, title, description ?? '', stops)], { type: 'application/gpx+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = gpxFileName(title)
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      trackEvent('gpx_download', { route: routeSlug, from: 'route' })
    } catch (e) {
      console.error('GPX failed:', e)
      alert(t('gpxFailed'))
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl bg-foreground font-bold text-background transition-transform hover:opacity-90 active:scale-[0.98]',
        className,
      )}
    >
      <Download className="h-5 w-5 shrink-0" aria-hidden />
      {children}
    </button>
  )
}
