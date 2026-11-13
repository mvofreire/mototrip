import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, BookOpen, ChevronRight, Compass, MapPin } from 'lucide-react'
import type { RouteWithDetails } from '@/types'
import { routePath } from '@/lib/route-url'
import { localizeRoute } from '@/lib/localize'
import { regionForRoute, regionLabel, textFor, type Region } from '@/lib/regions'
import { formatDistance, formatDuration } from '@/lib/utils'
import { coverOf, pickTranslation, type BlogPost } from '@/lib/blog/posts'
import { TrackedLink } from './tracked-link'

interface PostNextStepsProps {
  locale: string
  postSlug: string
  /** Routes the post links to, in the order they appear */
  routes: RouteWithDetails[]
  /** Other published posts to suggest */
  related: BlogPost[]
}

/**
 * End of a blog post: the routes it mentions, the region pages they belong to
 * and other guides, so a reader who finishes the article has somewhere to go.
 * Server-rendered with plain links (crawlable) and no maps, so it adds no
 * client weight beyond the click tracking.
 */
export async function PostNextSteps({ locale, postSlug, routes, related }: PostNextStepsProps) {
  const t = await getTranslations({ locale, namespace: 'blog' })

  const regions: Region[] = []
  for (const r of routes) {
    const region = regionForRoute(r)
    if (region && !regions.some((x) => x.slug === region.slug)) regions.push(region)
  }

  return (
    <section className="mt-14 space-y-12 border-t pt-10" aria-label={t('nextSteps')}>
      {routes.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">{t('routesInPost', { count: routes.length })}</h2>
            <p className="text-muted-foreground">{t('routesInPostDesc')}</p>
          </div>
          <ul className="divide-y overflow-hidden rounded-xl border bg-card">
            {routes.map((original, i) => {
              const route = localizeRoute(original, locale)
              const region = regionLabel(route, locale)
              return (
                <li key={route.id}>
                  <TrackedLink
                    href={routePath(locale, route)}
                    event="blog_route_click"
                    data={{ post: postSlug, route: route.slug ?? route.id, place: 'end' }}
                    className="group flex items-center gap-4 p-4 transition-colors hover:bg-muted/60"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold leading-tight group-hover:text-primary">{route.title}</span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {[region, formatDistance(route.distance_km), formatDuration(route.duration_minutes)]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" aria-hidden />
                  </TrackedLink>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-xl bg-gradient-brand p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-lg font-bold">{t('exploreTitle')}</p>
          <p className="text-sm text-white/85">{t('exploreDesc')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {regions.slice(0, 2).map((region) => (
            <TrackedLink
              key={region.slug}
              href={`/${locale}/regions/${region.slug}`}
              event="blog_region_click"
              data={{ post: postSlug, region: region.slug }}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900 shadow-sm transition-opacity hover:opacity-90"
            >
              <MapPin className="h-4 w-4 text-primary" aria-hidden />
              {t('moreInRegion', { region: textFor(region.name, locale) })}
            </TrackedLink>
          ))}
          <TrackedLink
            href={`/${locale}/explore`}
            event="blog_explore_click"
            data={{ post: postSlug }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/70 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <Compass className="h-4 w-4" aria-hidden />
            {t('exploreAll')}
          </TrackedLink>
        </div>
      </div>

      {related.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t('readNext')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((post) => {
              const c = pickTranslation(post, locale)
              if (!c) return null
              const img = coverOf(post)
              return (
                <TrackedLink
                  key={post.slug}
                  href={`/${locale}/blog/${post.slug}`}
                  event="blog_related_click"
                  data={{ post: postSlug, to: post.slug }}
                  className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                    {img ? (
                      <Image src={img} alt="" fill sizes="(max-width: 640px) 100vw, 256px" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-brand">
                        <BookOpen className="h-8 w-8 text-white/80" aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <h3 className="font-semibold leading-tight group-hover:text-primary">{c.title}</h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                    <span className="mt-auto inline-flex items-center gap-1 pt-1 text-sm font-medium text-primary">
                      {t('readMore')} <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                </TrackedLink>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
