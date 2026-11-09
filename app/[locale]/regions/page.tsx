import Link from 'next/link'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ChevronRight, Clock, MapPin, Route as RouteIcon } from 'lucide-react'
import { locales } from '@/i18n'
import { RoutesService } from '@/lib/services/routes.service'
import { REGIONS, regionForRoute, textFor, type Region } from '@/lib/regions'
import { getSiteUrl } from '@/lib/site-url'
import { routePath } from '@/lib/route-url'
import { localizeRoute } from '@/lib/localize'
import { formatDuration, getDifficultyColor } from '@/lib/utils'
import { RoutesOverviewMap } from '@/components/features/routes/routes-overview-map'
import type { RouteWithDetails } from '@/types'

export const revalidate = 3600

type Props = { params: { locale: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'regions' })
  return {
    title: t('indexTitle'),
    description: t('indexDescription'),
    alternates: {
      canonical: `/${params.locale}/regions`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/regions`])),
    },
  }
}

const km = (routes: RouteWithDetails[]) =>
  Math.round(routes.reduce((sum, r) => sum + Number(r.distance_km || 0), 0))

const byFeaturedThenTitle = (a: RouteWithDetails, b: RouteWithDetails) =>
  Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title)

export default async function RegionsIndexPage({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'regions' })
  const tAll = await getTranslations({ locale })
  const routes = (((await RoutesService.getRoutes()) as RouteWithDetails[]) ?? [])
    .map((r) => localizeRoute(r, locale))
    .sort(byFeaturedThenTitle)

  // Each route goes to its most specific destination page; routes whose region
  // has no page of its own are listed under the country, so none is left out.
  const grouped = new Map<string, RouteWithDetails[]>()
  const unplaced: RouteWithDetails[] = []
  for (const route of routes) {
    const region = regionForRoute(route)
    if (!region) {
      unplaced.push(route)
      continue
    }
    grouped.set(region.slug, [...(grouped.get(region.slug) ?? []), route])
  }

  const countries = REGIONS.filter((r) => r.kind === 'country')
  const countryRoutes = (c: Region) => routes.filter((r) => r.country === c.country)

  const difficultyLabel = (d: string) => tAll(`difficulty.${d}` as 'difficulty.easy')

  const base = getSiteUrl()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t('indexTitle'),
    itemListElement: routes.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${base}${routePath(locale, r)}`,
      name: r.title,
    })),
  }

  const RouteList = ({ items }: { items: RouteWithDetails[] }) => (
    <ul className="divide-y">
      {items.map((route) => (
        <li key={route.id}>
          <Link
            href={routePath(locale, route)}
            className="group flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <span className="font-medium group-hover:text-primary">{route.title}</span>
            <span className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {Math.round(Number(route.distance_km || 0))} km
              </span>
              {route.duration_minutes > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(route.duration_minutes)}
                </span>
              )}
              {route.difficulty && (
                <span className={`rounded-full border px-2 py-0.5 text-xs ${getDifficultyColor(route.difficulty)}`}>
                  {difficultyLabel(route.difficulty)}
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="mb-8 max-w-3xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">{t('eyebrow')}</p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t('indexTitle')}</h1>
        <p className="text-lg text-muted-foreground">{t('indexDescription')}</p>
        <div className="flex flex-wrap gap-6 pt-2 text-sm">
          <span className="flex items-center gap-2">
            <RouteIcon className="h-4 w-4 text-primary" />
            {t('routeCount', { count: routes.length })}
          </span>
          {km(routes) > 0 && (
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {t('totalKm', { km: km(routes).toLocaleString(locale) })}
            </span>
          )}
        </div>
      </header>

      {/* Jump to a destination */}
      <nav aria-label={t('allDestinations')} className="mb-8 space-y-3">
        {countries.map((country) => (
          <div key={country.slug} className="flex flex-wrap items-center gap-2">
            <a
              href={`#${country.slug}`}
              className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
            >
              {textFor(country.name, locale)}
              <span className="ml-1 opacity-80">({countryRoutes(country).length})</span>
            </a>
            {REGIONS.filter((r) => r.kind === 'region' && r.country === country.country).map((r) => (
              <a
                key={r.slug}
                href={`#${r.slug}`}
                className="rounded-full border px-4 py-1.5 text-sm transition-colors hover:border-primary hover:text-primary"
              >
                {textFor(r.name, locale)}
                <span className="ml-1 text-muted-foreground">({grouped.get(r.slug)?.length ?? 0})</span>
              </a>
            ))}
          </div>
        ))}
      </nav>

      {routes.length > 0 && (
        <section className="mb-12">
          <RoutesOverviewMap routes={routes} locale={locale} />
        </section>
      )}

      <div className="space-y-14">
        {countries.map((country) => {
          const regions = REGIONS.filter((r) => r.kind === 'region' && r.country === country.country)
          const all = countryRoutes(country)
          const rest = grouped.get(country.slug) ?? []
          return (
            <section key={country.slug} id={country.slug} className="scroll-mt-24 space-y-6">
              <div className="max-w-3xl space-y-2">
                <Link href={`/${locale}/regions/${country.slug}`} className="group inline-flex items-center gap-2">
                  <h2 className="text-3xl font-bold group-hover:text-primary">{textFor(country.name, locale)}</h2>
                  <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                </Link>
                <p className="text-sm text-muted-foreground">
                  {t('routeCount', { count: all.length })}
                  {km(all) > 0 && <> · {t('totalKm', { km: km(all).toLocaleString(locale) })}</>}
                </p>
                <p className="text-muted-foreground">{textFor(country.intro, locale)}</p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {regions.map((region) => {
                  const items = grouped.get(region.slug) ?? []
                  const name = textFor(region.name, locale)
                  return (
                    <article key={region.slug} id={region.slug} className="scroll-mt-24 rounded-lg border bg-card p-6">
                      <Link
                        href={`/${locale}/regions/${region.slug}`}
                        className="group mb-2 flex items-center justify-between gap-4"
                      >
                        <h3 className="text-xl font-bold group-hover:text-primary">{name}</h3>
                        <span className="flex shrink-0 items-center text-sm text-muted-foreground group-hover:text-primary">
                          {t('routeCount', { count: items.length })}
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </Link>
                      <p className="mb-3 text-sm text-muted-foreground">{textFor(region.intro, locale)}</p>
                      {items.length > 0 ? (
                        <RouteList items={items} />
                      ) : (
                        <p className="border-t pt-3 text-sm text-muted-foreground">
                          {t('empty', { name })}{' '}
                          <Link href={`/${locale}/submit`} className="text-primary hover:underline">
                            {tAll('nav.submitRoute')}
                          </Link>
                        </p>
                      )}
                      {items.length > 0 && (
                        <Link
                          href={`/${locale}/regions/${region.slug}`}
                          className="mt-3 inline-flex items-center text-sm font-medium text-primary hover:underline"
                        >
                          {t('viewAll', { name })}
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      )}
                    </article>
                  )
                })}

                {rest.length > 0 && (
                  <article className="rounded-lg border bg-card p-6">
                    <h3 className="mb-2 text-xl font-bold">{t('otherRegions')}</h3>
                    <RouteList items={rest} />
                  </article>
                )}
              </div>
            </section>
          )
        })}

        {unplaced.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">{t('otherDestinations')}</h2>
            <div className="rounded-lg border bg-card p-6">
              <RouteList items={unplaced} />
            </div>
          </section>
        )}
      </div>

      {/* Submit CTA */}
      <section className="mt-14 rounded-lg bg-gradient-brand p-8 text-center text-white">
        <h2 className="mb-2 text-2xl font-bold">{t('indexCtaTitle')}</h2>
        <p className="mb-6 opacity-90">{t('ctaDescription')}</p>
        <Link
          href={`/${locale}/submit`}
          className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-100"
        >
          {tAll('nav.submitRoute')}
        </Link>
      </section>
    </div>
  )
}
