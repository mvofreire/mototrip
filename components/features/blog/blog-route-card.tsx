'use client'

import { useTranslations } from 'next-intl'
import { ArrowRight, Clock, Map as MapIcon, MapPin, Mountain, Route as RouteIcon } from 'lucide-react'
import type { RouteWithDetails } from '@/types'
import { routePath } from '@/lib/route-url'
import { localizeRoute } from '@/lib/localize'
import { regionLabel } from '@/lib/regions'
import { formatDistance, formatDuration } from '@/lib/utils'
import { RouteThumbnail } from '@/components/features/routes/route-thumbnail'
import { TrackedLink } from './tracked-link'

interface BlogRouteCardProps {
  route: RouteWithDetails
  locale: string
  /** Post the card sits in (for analytics); unset in the admin preview */
  postSlug?: string
}

/**
 * Route card inside a blog post. Unlike the grid card it says plainly that it
 * opens the route (map, stops, GPX), since inside an article a card reads as
 * an illustration. It also skips the per-card comment count request.
 */
export function BlogRouteCard({ route: original, locale, postSlug }: BlogRouteCardProps) {
  const t = useTranslations()
  const route = localizeRoute(original, locale)
  const region = regionLabel(route, locale)

  return (
    <TrackedLink
      href={routePath(locale, route)}
      event="blog_route_click"
      data={{ post: postSlug ?? null, route: route.slug ?? route.id, place: 'inline' }}
      className="not-prose group block overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-sand-100">
        <RouteThumbnail route={route} />
        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur">
          <MapIcon className="h-3.5 w-3.5 text-primary" aria-hidden />
          {t('blog.openMap')}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold leading-tight group-hover:text-primary">{route.title}</h3>
          {region && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {region}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <span className="flex items-center gap-1.5" title={t('route.distance')}>
            <RouteIcon className="h-4 w-4 text-muted-foreground" aria-hidden />
            {formatDistance(route.distance_km)}
          </span>
          <span className="flex items-center gap-1.5" title={t('route.duration')}>
            <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
            {formatDuration(route.duration_minutes)}
          </span>
          {!!route.elevation_gain_m && (
            <span className="flex items-center gap-1.5" title={t('route.elevation')}>
              <Mountain className="h-4 w-4 text-muted-foreground" aria-hidden />
              {route.elevation_gain_m} m
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t bg-primary/5 px-4 py-3 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{t('blog.routeCta')}</p>
          <p className="text-xs text-muted-foreground group-hover:text-primary-foreground/80">{t('blog.routeCtaHint')}</p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
      </div>
    </TrackedLink>
  )
}
