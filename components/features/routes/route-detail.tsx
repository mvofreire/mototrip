import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { MapPin } from 'lucide-react'
import { regionForRoute, textFor } from '@/lib/regions'
import type { RouteWithDetails } from '@/types'
import { RouteHero } from '@/components/features/routes/route-hero'
import { RouteStats } from '@/components/features/routes/route-stats'
import { RouteMap } from '@/components/features/routes/route-map'
import { StopsTimeline } from '@/components/features/routes/stops-timeline'
import { RoutePhotos } from '@/components/features/routes/route-photos'
import { RouteReviewBanner } from '@/components/features/routes/route-review-banner'
import { CommentsList } from '@/components/features/comments'

/** Body of the route page (shared by the public and the private view) */
export function RouteDetail({ route, locale }: { route: RouteWithDetails; locale: string }) {
  const t = useTranslations('route')
  const tRegions = useTranslations('regions')
  const destination = regionForRoute(route)

  return (
    <div className="flex flex-col min-h-screen">
      <RouteHero route={route} />

      <div className="container mx-auto py-6 md:py-8 lg:py-12 px-4 max-w-7xl">
        <div className="space-y-6 md:space-y-8 min-w-0">
          {/* Edit button + review status (author and staff only) */}
          <RouteReviewBanner route={route} />

          <RouteStats route={route} />

          {destination && (
            <Link
              href={`/${locale}/regions/${destination.slug}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <MapPin className="h-4 w-4" />
              {tRegions('viewAll', { name: textFor(destination.name, locale) })}
            </Link>
          )}

          {route.description && (
            <div className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold">{t('aboutRoute')}</h2>
              <p className="text-muted-foreground leading-relaxed break-words">{route.description}</p>
            </div>
          )}

          <RoutePhotos route={route} />

          <div className="space-y-3">
            <h2 className="text-xl md:text-2xl font-bold">{t('routeMap')}</h2>
            <RouteMap route={route} />
          </div>

          {route.stops && route.stops.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold">{t('recommendedStops')}</h2>
              <StopsTimeline stops={route.stops} />
            </div>
          )}

          {/* Comments are only open on published routes */}
          {route.published && (
            <CommentsList routeId={route.id} locale={locale} routeAuthorId={route.user_id} />
          )}
        </div>
      </div>
    </div>
  )
}
