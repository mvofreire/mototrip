import Link from 'next/link'
import { toRouteCard } from '@/lib/routes/card'
import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowRight, Compass, MapPin, Route as RouteIcon } from 'lucide-react'
import { RoutesService } from '@/lib/services/routes.service'
import { regionForRoute, regionsOf, textFor } from '@/lib/regions'
import { loadRegions } from '@/lib/regions.server'
import { byFeaturedThenTitle, destinationCard, networkPaths, totalKm } from '@/lib/regions-page'
import { getSiteUrl } from '@/lib/site-url'
import { routePath } from '@/lib/route-url'
import { localizeRoute } from '@/lib/localize'
import { RoutesOverviewMap } from '@/components/features/routes/routes-overview-map'
import { CountUp } from '@/components/features/regions/count-up'
import { RegionNetworkHero } from '@/components/features/regions/region-network'
import { DestinationExplorer, type ExplorerCountry } from '@/components/features/regions/destination-explorer'
import type { RouteWithDetails } from '@/types'

export const revalidate = 3600

type Props = { params: { locale: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'regions' })
  return {
    title: t('indexTitle'),
    description: t('indexDescription'),
    alternates: buildAlternates(params.locale, '/regions'),
  }
}

const routeLink = (locale: string) => (r: RouteWithDetails) => ({ id: r.id, title: r.title, href: routePath(locale, r) })

export default async function RegionsIndexPage({ params: { locale } }: Props) {
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'regions' })
  const tAll = await getTranslations({ locale })
  const [catalog, raw] = await Promise.all([loadRegions(), RoutesService.getRoutes().catch(() => [])])
  const routes = ((raw as RouteWithDetails[]) ?? []).map((r) => localizeRoute(r, locale)).sort(byFeaturedThenTitle)

  // Each route goes to its most specific destination page; routes whose region
  // has no page of its own are listed under the country, so none is left out.
  const grouped = new Map<string, RouteWithDetails[]>()
  const unplaced: RouteWithDetails[] = []
  for (const route of routes) {
    const region = regionForRoute(route, catalog)
    if (!region) {
      unplaced.push(route)
      continue
    }
    grouped.set(region.slug, [...(grouped.get(region.slug) ?? []), route])
  }

  const countries: ExplorerCountry[] = catalog
    .filter((c) => c.kind === 'country')
    .map((c) => {
      const all = routes.filter((r) => r.country === c.country)
      return {
        slug: c.slug,
        code: c.country,
        name: textFor(c.name, locale),
        flag: c.flag,
        intro: textFor(c.intro, locale),
        count: all.length,
        km: totalKm(all),
        regions: regionsOf(c.country, catalog).map((r) => destinationCard(r, grouped.get(r.slug) ?? [], locale)),
        rest: (grouped.get(c.slug) ?? []).map(routeLink(locale)),
      }
    })
  const destinationTotal = catalog.filter((r) => r.kind === 'region').length
  const km = totalKm(routes)

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

  const stats = [
    { icon: RouteIcon, value: routes.length, label: t('statRoutes') },
    { icon: MapPin, value: km, label: t('statKm') },
    { icon: Compass, value: destinationTotal, label: t('statDestinations') },
  ]

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      {/* HERO: every route on the site, drawn together */}
      <section className="relative overflow-hidden bg-[#0d0f14] text-steel-50">
        <RegionNetworkHero
          paths={networkPaths(routes, 800, 600, 24, 40)}
          weight={1.8}
          className="absolute inset-y-0 right-0 h-full w-full opacity-60 md:w-3/5 md:opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0f14] via-[#0d0f14]/85 to-[#0d0f14]/10" />
        <div className="container relative mx-auto max-w-7xl px-4 pb-16 pt-14 md:pb-24 md:pt-20">
          <div className="max-w-2xl space-y-6">
            <p className="dest-rise text-sm font-bold uppercase tracking-[0.14em] text-brand-400">{t('eyebrow')}</p>
            <h1
              className="dest-rise font-display text-[clamp(2.75rem,6.5vw,5.5rem)] font-extrabold uppercase !leading-[0.92]"
              style={{ '--d': '80ms' } as React.CSSProperties}
            >
              {t('indexTitle')}
            </h1>
            <p className="dest-rise text-lg leading-relaxed text-steel-300" style={{ '--d': '160ms' } as React.CSSProperties}>
              {t('indexDescription')}
            </p>
          </div>
          <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
            {stats.map(({ icon: Icon, value, label }, i) => (
              <div
                key={label}
                className="dest-rise rounded-xl border border-steel-800 bg-steel-900/70 p-4 backdrop-blur"
                style={{ '--d': `${240 + i * 80}ms` } as React.CSSProperties}
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
        <DestinationExplorer countries={countries} locale={locale} />

        {unplaced.length > 0 && (
          <section className="dest-reveal mt-16 space-y-4">
            <h2 className="font-display text-3xl font-extrabold uppercase">{t('otherDestinations')}</h2>
            <ul className="grid gap-2 rounded-2xl border bg-card p-5 sm:grid-cols-2">
              {unplaced.map((r) => (
                <li key={r.id}>
                  <Link href={routePath(locale, r)} className="flex items-center gap-2 hover:text-primary">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {routes.length > 0 && (
          <section className="dest-reveal mt-16 space-y-5">
            <h2 className="font-display text-3xl font-extrabold uppercase">{t('mapTitle')}</h2>
            <RoutesOverviewMap routes={routes.map((r) => toRouteCard(r, locale))} locale={locale} />
          </section>
        )}

        {/* Submit CTA */}
        <section className="dest-reveal relative mt-16 overflow-hidden rounded-2xl bg-gradient-brand p-8 text-center text-white md:p-12">
          <h2 className="mb-2 font-display text-3xl font-extrabold uppercase">{t('indexCtaTitle')}</h2>
          <p className="mx-auto mb-6 max-w-xl opacity-90">{t('ctaDescription')}</p>
          <Link
            href={`/${locale}/submit`}
            className="group inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-white px-6 font-semibold text-gray-900 transition-colors hover:bg-gray-100"
          >
            {tAll('nav.submitRoute')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </section>
      </div>
    </div>
  )
}
