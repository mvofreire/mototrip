import Link from 'next/link'
import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowRight, MapPin } from 'lucide-react'
import { REGIONS, regionForRoute, regionLabel, textFor } from '@/lib/regions'
import { googleMapsUrl, routePoints, sortStops } from '@/lib/route-export'
import { formatDistance, formatDuration, formatElevation } from '@/lib/utils'
import type { RouteWithDetails } from '@/types'
import { RoutePhotos } from '@/components/features/routes/route-photos'
import { RouteReviewBanner } from '@/components/features/routes/route-review-banner'
import { CommentsList } from '@/components/features/comments'
import { RouteReviews } from '@/components/features/routes/route-reviews'
import { RouteCuratorReview } from '@/components/features/routes/route-curator-review'
import { SaveRouteButton } from '@/components/features/routes/save-route-button'
import { RouteViewProvider } from './detail/route-view-context'
import { RouteMapHero } from './detail/route-map-hero'
import { MobileActionBar, RatingChips, RouteSplit } from './detail/route-layout'
import { RouteTabs } from './detail/route-tabs'
import { RouteStopList } from './detail/route-stop-list'
import { GoogleMapsRouteLink, GpxButton } from './detail/route-nav-actions'
import { ShareRouteDialog } from './detail/share-route-dialog'

/**
 * Body of the route page (shared by the public and the private view).
 * "Map first": the route map leads, the details sit in a panel with tabs
 * (a sheet over the map on phones, a side panel on desktop).
 */
export function RouteDetail({
  route: unsorted,
  locale,
  guides,
  footer,
}: {
  route: RouteWithDetails
  locale: string
  /** Blog guides that feature this route (public page only) */
  guides?: ReactNode
  /** End of the page, e.g. related routes (public page only) */
  footer?: ReactNode
}) {
  const t = useTranslations()
  const stops = sortStops(unsorted.stops)
  const route = { ...unsorted, stops }
  const coords = routePoints(route.polyline_coordinates)
  const mapsUrl = googleMapsUrl(coords)
  const routeSlug = route.slug ?? route.id

  const region = regionForRoute(route)
  const country = region && REGIONS.find((r) => r.kind === 'country' && r.country === region.country)
  const regionName = regionLabel(route, locale)
  const place = [regionName, country && region?.kind === 'region' ? textFor(country.name, locale) : null]
    .filter(Boolean)
    .join(', ')

  const curatorScore = route.curator_review ? Number(route.curator_review.overall) : null
  const communityScore = route.rating_average != null ? Number(route.rating_average) : null
  const ratingCount = Number(route.rating_count ?? 0)

  const stats = [
    { label: t('route.distance'), value: formatDistance(route.distance_km) },
    { label: t('route.duration'), value: formatDuration(route.duration_minutes) },
    {
      label: t('route.elevation'),
      value: route.elevation_gain_m ? formatElevation(route.elevation_gain_m) : t('route.notAvailable'),
    },
    stops.length
      ? { label: t('route.stopsLabel'), value: String(stops.length) }
      : { label: t('route.region'), value: regionName || t('route.unknown') },
  ]

  const gpx = (className: string, label: ReactNode, aria?: string) => (
    <GpxButton
      title={route.title}
      description={route.description}
      coords={coords}
      stops={stops}
      routeSlug={routeSlug}
      className={className}
      aria-label={aria}
    >
      {label}
    </GpxButton>
  )

  const tabs = [
    {
      id: 'about' as const,
      label: t('route.tabAbout'),
      content: (
        <div className="space-y-6">
          {guides}
          {route.description && (
            <section className="space-y-2">
              <h2 className="text-2xl font-bold">{t('route.aboutRoute')}</h2>
              <p className="leading-relaxed text-muted-foreground break-words">{route.description}</p>
            </section>
          )}
          <RouteCuratorReview review={route.curator_review} />
          <RoutePhotos route={route} />
          {region && (
            <Link
              href={`/${locale}/regions/${region.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <MapPin className="h-4 w-4" aria-hidden />
              {t('regions.viewAll', { name: textFor(region.name, locale) })}
            </Link>
          )}
        </div>
      ),
    },
    ...(stops.length
      ? [
          {
            id: 'stops' as const,
            label: t('route.tabStops', { count: stops.length }),
            content: (
              <section aria-labelledby="stops-title">
                <h2 id="stops-title" className="sr-only">
                  {t('route.recommendedStops')}
                </h2>
                <p className="mb-3 hidden text-sm text-muted-foreground lg:block">{t('route.stopsHint')}</p>
                <RouteStopList stops={stops} routeSlug={routeSlug} />
              </section>
            ),
          },
        ]
      : []),
    // Reviews and comments are only open on published routes
    ...(route.published
      ? [
          {
            id: 'reviews' as const,
            label: ratingCount ? t('route.tabReviewsCount', { count: ratingCount }) : t('route.tabReviews'),
            content: (
              <div className="space-y-8">
                <RouteReviews route={route} />
                <CommentsList routeId={route.id} locale={locale} routeAuthorId={route.user_id} />
              </div>
            ),
          },
        ]
      : []),
  ]

  const shareButton = route.published ? <ShareRouteDialog route={route} /> : null

  const panel = (
    <>
      {/* Edit button + review status (author and staff only) */}
      <RouteReviewBanner route={route} />

      <nav aria-label={t('route.breadcrumb')} className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground lg:text-sm">
        <Link href={`/${locale}/regions`} className="hover:text-foreground">
          {t('regions.allDestinations')}
        </Link>
        {country && (
          <>
            <span aria-hidden>›</span>
            <Link href={`/${locale}/regions/${country.slug}`} className="hover:text-foreground">
              {textFor(country.name, locale)}
            </Link>
          </>
        )}
        {region && region.kind === 'region' && (
          <>
            <span aria-hidden>›</span>
            <Link href={`/${locale}/regions/${region.slug}`} className="hover:text-foreground">
              {textFor(region.name, locale)}
            </Link>
          </>
        )}
      </nav>

      <div className="flex items-start gap-4">
        <h1 className="min-w-0 flex-1 text-[2.5rem] font-extrabold leading-[0.95] break-words lg:text-5xl">{route.title}</h1>
        <div className="hidden shrink-0 gap-2 pt-1 lg:flex">
          <SaveRouteButton routeId={route.id} iconOnly className="border" />
          {shareButton && <ShareRouteDialog route={route} className="border" />}
        </div>
      </div>

      {place && (
        <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground lg:text-[15px]">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{place}</span>
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="inline-flex h-7 items-center rounded-full border px-3 text-xs font-semibold">
          {t(`categories.${route.category}`)}
        </span>
        <span className="inline-flex h-7 items-center rounded-full border px-3 text-xs font-semibold">
          {t(`difficulty.${route.difficulty}`)}
        </span>
        {route.featured && (
          <span className="inline-flex h-7 items-center rounded-full bg-primary px-3 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
            {t('route.featured')}
          </span>
        )}
        <RatingChips curator={curatorScore} community={communityScore} count={ratingCount} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-muted/60 p-3">
            <dd className="truncate font-display text-2xl font-bold uppercase leading-none">{s.value}</dd>
            <dt className="mt-1 truncate text-xs text-muted-foreground">{s.label}</dt>
          </div>
        ))}
      </dl>

      <div id="route-ctas" className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <GoogleMapsRouteLink
          href={mapsUrl}
          routeSlug={routeSlug}
          className="h-[4.5rem] flex-col gap-0.5 text-[15px] motion-safe:animate-[cta-glow_2.4s_ease-out_1.2s_infinite] lg:h-14 lg:flex-row lg:gap-2 lg:text-base"
        >
          <span className="lg:hidden">Google Maps</span>
          <span className="hidden lg:inline">{t('route.openInGoogleMaps')}</span>
        </GoogleMapsRouteLink>
        {gpx('h-[4.5rem] flex-col gap-0.5 text-[15px] lg:h-14 lg:flex-row lg:gap-2 lg:text-base', t('route.downloadGPX'))}
      </div>
      {coords.length > 0 && <p className="mt-2 text-center text-xs text-muted-foreground lg:text-left">{t('route.gpxHint')}</p>}

      <RouteTabs tabs={tabs} label={t('route.sections')} />
    </>
  )

  return (
    <RouteViewProvider initialTab="about">
      <div className="flex min-h-screen flex-col">
        <RouteSplit
          map={
            <RouteMapHero
              title={route.title}
              routeSlug={routeSlug}
              thumbnailUrl={route.thumbnail_url}
              coords={coords}
              stops={stops}
              mobileActions={
                <>
                  <SaveRouteButton routeId={route.id} iconOnly className="bg-background/75 backdrop-blur" />
                  {shareButton && <ShareRouteDialog route={route} className="bg-background/75 backdrop-blur" />}
                </>
              }
              fullscreenActions={
                <>
                  {gpx('h-12 text-sm', 'GPX', t('route.downloadGPX'))}
                  <GoogleMapsRouteLink href={mapsUrl} routeSlug={routeSlug} className="h-12 text-sm">
                    {t('route.openInGoogleMaps')}
                  </GoogleMapsRouteLink>
                </>
              }
            />
          }
          panel={panel}
        />

        <div className="container mx-auto w-full max-w-7xl space-y-10 px-4 py-10 lg:py-14">
          {footer}

          <section aria-labelledby="explore-more" className="space-y-3">
            <h2 id="explore-more" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {t('route.exploreMore')}
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/${locale}/explore?category=${route.category}`}
                className="inline-flex h-10 items-center rounded-full bg-muted px-4 text-sm font-semibold transition-colors hover:bg-muted/70"
              >
                {t(`categories.${route.category}`)}
              </Link>
              <Link
                href={`/${locale}/explore?difficulty=${route.difficulty}`}
                className="inline-flex h-10 items-center rounded-full bg-muted px-4 text-sm font-semibold transition-colors hover:bg-muted/70"
              >
                {t(`difficulty.${route.difficulty}`)}
              </Link>
              {region && (
                <Link
                  href={`/${locale}/regions/${region.slug}`}
                  className="inline-flex h-10 items-center rounded-full bg-muted px-4 text-sm font-semibold transition-colors hover:bg-muted/70"
                >
                  {textFor(region.name, locale)}
                </Link>
              )}
              <Link
                href={`/${locale}/blog`}
                className="inline-flex h-10 items-center rounded-full bg-muted px-4 text-sm font-semibold transition-colors hover:bg-muted/70"
              >
                {t('nav.blog')}
              </Link>
            </div>
          </section>

          <Link
            href={`/${locale}/submit`}
            className="group flex flex-col gap-4 rounded-2xl border-2 border-dashed p-6 transition-colors hover:border-primary/60 sm:flex-row sm:items-center sm:justify-between lg:p-8"
          >
            <span>
              <span className="block font-display text-2xl font-extrabold uppercase lg:text-3xl">{t('route.submitTitle')}</span>
              <span className="text-sm text-muted-foreground lg:text-base">{t('route.submitText')}</span>
            </span>
            <span className="inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-xl bg-foreground px-5 font-bold text-background sm:self-auto">
              {t('nav.submitRoute')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </span>
          </Link>
        </div>

        {coords.length > 0 && (
          <MobileActionBar watchId="route-ctas">
            {gpx('h-12 text-sm', 'GPX', t('route.downloadGPX'))}
            <GoogleMapsRouteLink href={mapsUrl} routeSlug={routeSlug} className="h-12 text-sm">
              {t('route.startInGoogleMaps')}
            </GoogleMapsRouteLink>
          </MobileActionBar>
        )}
      </div>
    </RouteViewProvider>
  )
}
