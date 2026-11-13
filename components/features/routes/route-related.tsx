import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, BookOpen, ChevronRight, Clock, MapPin, Route as RouteIcon } from 'lucide-react'
import { routePath } from '@/lib/route-url'
import { localizeRoute } from '@/lib/localize'
import { regionLabel } from '@/lib/regions'
import { formatDistance, formatDuration, formatRating } from '@/lib/utils'
import type { RelatedRoute, RoutePost } from '@/lib/routes/related'
import { TrackedLink } from '@/components/features/blog/tracked-link'

/** "This route is featured in our guide…": links to the blog posts that use it */
export async function RouteInPosts({ posts, locale, routeSlug }: { posts: RoutePost[]; locale: string; routeSlug: string }) {
  if (!posts.length) return null
  const t = await getTranslations({ locale, namespace: 'route.related' })
  return (
    <div className="space-y-2">
      {posts.slice(0, 2).map((post) => (
        <TrackedLink
          key={post.slug}
          href={`/${locale}/blog/${post.slug}`}
          event="route_post_click"
          data={{ route: routeSlug, post: post.slug }}
          className="group flex items-center gap-4 rounded-xl border border-primary/30 bg-primary/5 p-4 transition-colors hover:border-primary hover:bg-primary/10"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-medium uppercase tracking-wide text-primary">{t('inGuide')}</span>
            <span className="block font-semibold leading-tight group-hover:text-primary">{post.title}</span>
          </span>
          <span className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary sm:inline-flex">
            {t('readGuide')}
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" aria-hidden />
        </TrackedLink>
      ))}
    </div>
  )
}

/** End of the route page: other routes worth riding (static map images, no Leaflet) */
export async function RelatedRoutes({
  routes,
  locale,
  routeSlug,
  exploreHref,
}: {
  routes: RelatedRoute[]
  locale: string
  routeSlug: string
  /** Region page of the current route, or /explore */
  exploreHref: string
}) {
  if (!routes.length) return null
  const t = await getTranslations({ locale })
  return (
    <section className="space-y-4 border-t pt-8" aria-labelledby="related-routes">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="related-routes" className="text-xl font-bold md:text-2xl">{t('route.related.title')}</h2>
        <TrackedLink
          href={exploreHref}
          event="route_related_more_click"
          data={{ route: routeSlug }}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {t('route.related.seeMore')} <ArrowRight className="h-4 w-4" aria-hidden />
        </TrackedLink>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {routes.map((original) => {
          const route = localizeRoute(original, locale)
          const region = regionLabel(route, locale)
          return (
            <TrackedLink
              key={route.id}
              href={routePath(locale, route)}
              event="route_related_click"
              data={{ route: routeSlug, to: route.slug ?? route.id }}
              className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                {route.thumbnail_url ? (
                  <Image
                    src={route.thumbnail_url}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-brand">
                    <RouteIcon className="h-8 w-8 text-white/80" aria-hidden />
                  </div>
                )}
                {route.curator_rating != null && (
                  <span className="absolute bottom-2 left-2 rounded-full bg-gradient-brand px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
                    MotoTrip {formatRating(Number(route.curator_rating))}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="line-clamp-2 font-semibold leading-tight group-hover:text-primary">{route.title}</h3>
                {region && (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" aria-hidden />
                    {region}
                  </p>
                )}
                <div className="mt-auto flex gap-4 pt-1 text-sm">
                  <span className="flex items-center gap-1.5">
                    <RouteIcon className="h-4 w-4 text-muted-foreground" aria-hidden />
                    {formatDistance(Number(route.distance_km))}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
                    {formatDuration(route.duration_minutes)}
                  </span>
                </div>
              </div>
            </TrackedLink>
          )
        })}
      </div>
    </section>
  )
}
