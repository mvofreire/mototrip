import Link from 'next/link'
import { toRouteCard } from '@/lib/routes/card'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowRight, ChevronRight, Clock, Compass, MapPin, Route as RouteIcon } from 'lucide-react'
import { locales } from '@/i18n'
import { RoutesService } from '@/lib/services/routes.service'
import { countryOf, getRegion, regionsOf, routeInRegion, textFor, type Region } from '@/lib/regions'
import { loadRegions } from '@/lib/regions.server'
import { byFeaturedThenTitle, destinationCard, networkPaths, totalKm } from '@/lib/regions-page'
import { getSiteUrl } from '@/lib/site-url'
import { routePath } from '@/lib/route-url'
import { localizeRoute } from '@/lib/localize'
import { formatDuration } from '@/lib/utils'
import { RoutesOverviewMap } from '@/components/features/routes/routes-overview-map'
import { CountUp } from '@/components/features/regions/count-up'
import { RegionNetworkHero } from '@/components/features/regions/region-network'
import { DestinationCard } from '@/components/features/regions/destination-card'
import { RegionRoutes } from '@/components/features/regions/region-routes'
import { Button } from '@/components/ui/button'
import type { RouteWithDetails } from '@/types'

// New routes show up within the hour; new destinations render on first visit
export const revalidate = 3600

type Props = { params: { locale: string; slug: string } }

export async function generateStaticParams() {
  const regions = await loadRegions()
  return locales.flatMap((locale) => regions.map((r) => ({ locale, slug: r.slug })))
}

async function publishedRoutes(): Promise<RouteWithDetails[]> {
  const all = ((await RoutesService.getRoutes().catch(() => [])) as RouteWithDetails[]) ?? []
  return all.sort(byFeaturedThenTitle)
}

/** Intro of the destination, or a generic line when staff haven't written one yet */
async function introFor(region: Region, locale: string) {
  const intro = textFor(region.intro, locale)
  if (intro) return intro
  const t = await getTranslations({ locale, namespace: 'regions' })
  return t('introFallback', { name: textFor(region.name, locale) })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const catalog = await loadRegions()
  const region = getRegion(params.slug, catalog)
  if (!region) return {}
  const t = await getTranslations({ locale: params.locale, namespace: 'regions' })
  const name = textFor(region.name, params.locale)
  const routes = (await publishedRoutes()).filter((r) => routeInRegion(r, region))
  const title = t('metaTitle', { name })
  const description = await introFor(region, params.locale)
  const image = routes.find((r) => r.thumbnail_url)?.thumbnail_url

  return {
    title,
    description,
    alternates: buildAlternates(params.locale, `/regions/${region.slug}`),
    openGraph: {
      type: 'website',
      title,
      description,
      url: `/${params.locale}/regions/${region.slug}`,
      images: image ? [{ url: image, alt: title }] : undefined,
    },
  }
}

export default async function RegionPage({ params }: Props) {
  setRequestLocale(params.locale)

  const { locale } = params
  const catalog = await loadRegions()
  const region = getRegion(params.slug, catalog)
  if (!region) notFound()

  const t = await getTranslations({ locale, namespace: 'regions' })
  const tAll = await getTranslations({ locale })
  const name = textFor(region.name, locale)
  const intro = await introFor(region, locale)
  const all = await publishedRoutes()
  const allLocalized = all.map((r) => localizeRoute(r, locale))
  const routes = all.filter((r) => routeInRegion(r, region))
  const localized = allLocalized.filter((r) => routeInRegion(r, region))
  // What the browser gets: card data, not the full routes with their tracks
  const cards = routes.map((r) => toRouteCard(r, locale))
  const km = totalKm(routes)
  const minutes = routes.reduce((s, r) => s + (r.duration_minutes || 0), 0)

  const country = countryOf(region, catalog)
  const children = regionsOf(region.country, catalog)
  // Country page: its regions; region page: the other regions of the country
  const childCards = children
    .filter((c) => c.slug !== region.slug)
    .map((c) => destinationCard(c, allLocalized.filter((r) => routeInRegion(r, c)), locale))
  const otherCountries = catalog.filter((r) => r.kind === 'country' && r.country !== region.country)

  const base = getSiteUrl()
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'MotoTrip', item: `${base}/${locale}` },
        { '@type': 'ListItem', position: 2, name: t('allDestinations'), item: `${base}/${locale}/regions` },
        ...(region.kind === 'region' && country
          ? [{ '@type': 'ListItem', position: 3, name: textFor(country.name, locale), item: `${base}/${locale}/regions/${country.slug}` }]
          : []),
        {
          '@type': 'ListItem',
          position: region.kind === 'region' && country ? 4 : 3,
          name,
          item: `${base}/${locale}/regions/${region.slug}`,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: t('metaTitle', { name }),
      itemListElement: localized.map((r, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${base}${routePath(locale, r)}`,
        name: r.title,
      })),
    },
  ]

  const stats = [
    { icon: RouteIcon, value: routes.length, label: t('statRoutes') },
    { icon: MapPin, value: km, label: t('statKm') },
    ...(region.kind === 'country'
      ? [{ icon: Compass, value: children.length, label: t('statDestinations') }]
      : minutes > 0
        ? [{ icon: Clock, value: Math.round(minutes / 60), label: t('statHours') }]
        : []),
  ]
  const delay = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      {/* HERO: the destination's roads drawing themselves */}
      <section className="relative overflow-hidden bg-[#0d0f14] text-steel-50">
        <RegionNetworkHero
          paths={networkPaths(routes, 800, 600, 48, 16)}
          className="absolute inset-y-0 right-0 h-full w-full opacity-80 md:w-3/5"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0f14] via-[#0d0f14]/85 to-[#0d0f14]/10" />
        <div className="container relative mx-auto max-w-7xl px-4 pb-14 pt-8 md:pb-20 md:pt-10">
          <nav aria-label="Breadcrumb" className="dest-rise mb-10 flex flex-wrap items-center gap-1 text-sm text-steel-400">
            <Link href={`/${locale}/regions`} className="hover:text-steel-50">
              {t('allDestinations')}
            </Link>
            {region.kind === 'region' && country && (
              <>
                <ChevronRight className="h-4 w-4" aria-hidden />
                <Link href={`/${locale}/regions/${country.slug}`} className="hover:text-steel-50">
                  {textFor(country.name, locale)}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4" aria-hidden />
            <span className="text-steel-50">{name}</span>
          </nav>

          <div className="max-w-2xl space-y-5">
            <p className="dest-rise text-sm font-bold uppercase tracking-[0.14em] text-brand-400" style={delay(60)}>
              {region.flag && <span className="mr-2" aria-hidden>{region.flag}</span>}
              {t('eyebrow')}
            </p>
            <h1
              className="dest-rise font-display text-[clamp(2.75rem,6.5vw,5.5rem)] font-extrabold uppercase !leading-[0.92]"
              style={delay(120)}
            >
              {name}
            </h1>
            <p className="dest-rise text-lg leading-relaxed text-steel-300" style={delay(200)}>
              {intro}
            </p>
            <div className="dest-rise flex flex-wrap gap-3 pt-1" style={delay(260)}>
              {routes.length > 0 && (
                <a
                  href="#routes"
                  className="group inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-brand-600 px-5 font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  {t('routesHeading', { name })}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </a>
              )}
              <Link
                href={`/${locale}/submit`}
                className="inline-flex min-h-[48px] items-center rounded-lg border border-steel-600 px-5 font-semibold text-steel-50 transition-colors hover:bg-white/5"
              >
                {tAll('nav.submitRoute')}
              </Link>
            </div>
          </div>

          <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
            {stats.map(({ icon: Icon, value, label }, i) => (
              <div
                key={label}
                className="dest-rise rounded-xl border border-steel-800 bg-steel-900/70 p-4 backdrop-blur"
                style={delay(320 + i * 80)}
              >
                <dt className="flex items-center gap-1.5 text-xs text-steel-400">
                  <Icon className="h-3.5 w-3.5 text-brand-500" aria-hidden />
                  {label}
                </dt>
                <dd className="font-display text-3xl font-extrabold md:text-4xl">
                  <CountUp value={value} locale={locale} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-10 md:py-14">
        {/* Regions of this country */}
        {region.kind === 'country' && childCards.length > 0 && (
          <section className="mb-16 space-y-6">
            <h2 className="font-display text-3xl font-extrabold uppercase">{t('regionsIn', { name })}</h2>
            <div className="dest-swap grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {childCards.map((c, i) => (
                <DestinationCard
                  key={c.slug}
                  data={c}
                  index={i}
                  labels={{
                    routes: t('routeCount', { count: c.count }),
                    km: t('totalKm', { km: c.km.toLocaleString(locale) }),
                    view: t('explore'),
                    empty: t('emptyShort'),
                    submit: tAll('nav.submitRoute'),
                    submitHref: `/${locale}/submit`,
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {routes.length > 0 ? (
          <>
            <section id="routes" className="scroll-mt-24 space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="font-display text-3xl font-extrabold uppercase">{t('routesHeading', { name })}</h2>
                {minutes > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {t('routeCount', { count: routes.length })} · {formatDuration(minutes)}
                  </p>
                )}
              </div>
              <RegionRoutes routes={cards} locale={locale} />
            </section>

            <section className="dest-reveal mt-16 space-y-5">
              <h2 className="font-display text-3xl font-extrabold uppercase">{t('mapTitle')}</h2>
              <RoutesOverviewMap routes={cards} locale={locale} />
            </section>
          </>
        ) : (
          <section className="rounded-2xl border border-dashed p-10 text-center">
            <p className="mb-4 text-muted-foreground">{t('empty', { name })}</p>
            <Button asChild>
              <Link href={`/${locale}/submit`}>{tAll('nav.submitRoute')}</Link>
            </Button>
          </section>
        )}

        {/* Sibling regions (internal links) */}
        {region.kind === 'region' && childCards.length > 0 && (
          <section className="dest-reveal mt-16 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-3xl font-extrabold uppercase">
                {t('regionsIn', { name: country ? textFor(country.name, locale) : region.country })}
              </h2>
              {country && (
                <Link
                  href={`/${locale}/regions/${country.slug}`}
                  className="group inline-flex items-center gap-1 text-sm font-semibold text-primary"
                >
                  {t('viewAll', { name: textFor(country.name, locale) })}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              )}
            </div>
            <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin]">
              {childCards.map((c, i) => (
                <div key={c.slug} className="w-[280px] shrink-0 snap-start sm:w-[320px]">
                  <DestinationCard
                    data={c}
                    index={i}
                    labels={{
                      routes: t('routeCount', { count: c.count }),
                      km: t('totalKm', { km: c.km.toLocaleString(locale) }),
                      view: t('explore'),
                      empty: t('emptyShort'),
                      submit: tAll('nav.submitRoute'),
                      submitHref: `/${locale}/submit`,
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Submit CTA */}
        <section className="dest-reveal mt-16 rounded-2xl bg-gradient-brand p-8 text-center text-white md:p-12">
          <h2 className="mb-2 font-display text-3xl font-extrabold uppercase">{t('ctaTitle', { name })}</h2>
          <p className="mx-auto mb-6 max-w-xl opacity-90">{t('ctaDescription')}</p>
          <Link
            href={`/${locale}/submit`}
            className="group inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-white px-6 font-semibold text-gray-900 transition-colors hover:bg-gray-100"
          >
            {tAll('nav.submitRoute')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </section>

        {/* Other countries (internal links) */}
        {otherCountries.length > 0 && (
          <section className="dest-reveal mt-12 space-y-4">
            <h2 className="text-xl font-bold">{t('otherDestinations')}</h2>
            <div className="flex flex-wrap gap-2">
              {otherCountries.map((o) => (
                <Link
                  key={o.slug}
                  href={`/${locale}/regions/${o.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                >
                  {o.flag && <span aria-hidden>{o.flag}</span>}
                  {textFor(o.name, locale)}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
