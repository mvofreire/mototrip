import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ChevronRight, MapPin, Route as RouteIcon } from 'lucide-react'
import { locales } from '@/i18n'
import { RoutesService } from '@/lib/services/routes.service'
import { REGIONS, getRegion, routeInRegion, textFor } from '@/lib/regions'
import { getSiteUrl } from '@/lib/site-url'
import { RouteCard } from '@/components/features/routes/route-card'
import { RoutesOverviewMap } from '@/components/features/routes/routes-overview-map'
import { Button } from '@/components/ui/button'
import type { RouteWithDetails } from '@/types'

// New routes show up within the hour
export const revalidate = 3600

type Props = { params: { locale: string; slug: string } }

export function generateStaticParams() {
  return locales.flatMap((locale) => REGIONS.map((r) => ({ locale, slug: r.slug })))
}

async function routesFor(slug: string): Promise<RouteWithDetails[]> {
  const region = getRegion(slug)
  if (!region) return []
  const all = (await RoutesService.getRoutes()) as RouteWithDetails[]
  return all
    .filter((r) => routeInRegion(r, region))
    .sort((a, b) => Number(b.featured) - Number(a.featured))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const region = getRegion(params.slug)
  if (!region) return {}
  const t = await getTranslations({ locale: params.locale, namespace: 'regions' })
  const name = textFor(region.name, params.locale)
  const routes = await routesFor(params.slug).catch(() => [])
  const title = t('metaTitle', { name })
  const description = textFor(region.intro, params.locale)
  const image = routes.find((r) => r.thumbnail_url)?.thumbnail_url

  return {
    title,
    description,
    alternates: {
      canonical: `/${params.locale}/regions/${region.slug}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/regions/${region.slug}`])),
    },
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
  const { locale } = params
  const region = getRegion(params.slug)
  if (!region) notFound()

  const t = await getTranslations({ locale, namespace: 'regions' })
  const tAll = await getTranslations({ locale })
  const name = textFor(region.name, locale)
  const routes = await routesFor(region.slug)
  const totalKm = Math.round(routes.reduce((sum, r) => sum + Number(r.distance_km || 0), 0))

  // Country page: its regions; region page: the country + sibling regions
  const country = REGIONS.find((r) => r.kind === 'country' && r.country === region.country)!
  const children = REGIONS.filter((r) => r.kind === 'region' && r.country === region.country)
  const childCounts = new Map(
    children.map((c) => [c.slug, routes.filter((r) => routeInRegion(r, c)).length]),
  )
  const others = REGIONS.filter((r) => r.slug !== region.slug)

  const base = getSiteUrl()
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'MotoTrip', item: `${base}/${locale}` },
        { '@type': 'ListItem', position: 2, name: t('allDestinations'), item: `${base}/${locale}/regions` },
        ...(region.kind === 'region'
          ? [{ '@type': 'ListItem', position: 3, name: textFor(country.name, locale), item: `${base}/${locale}/regions/${country.slug}` }]
          : []),
        {
          '@type': 'ListItem',
          position: region.kind === 'region' ? 4 : 3,
          name,
          item: `${base}/${locale}/regions/${region.slug}`,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: t('metaTitle', { name }),
      itemListElement: routes.map((r, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${base}/${locale}/routes/${r.id}`,
        name: r.title,
      })),
    },
  ]

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href={`/${locale}/regions`} className="hover:text-foreground">
          {t('allDestinations')}
        </Link>
        {region.kind === 'region' && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/${locale}/regions/${country.slug}`} className="hover:text-foreground">
              {textFor(country.name, locale)}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{name}</span>
      </nav>

      {/* Header */}
      <header className="mb-8 max-w-3xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">{t('eyebrow')}</p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t('heading', { name })}</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">{textFor(region.intro, locale)}</p>
        <div className="flex flex-wrap gap-6 pt-2 text-sm">
          <span className="flex items-center gap-2">
            <RouteIcon className="h-4 w-4 text-primary" />
            {t('routeCount', { count: routes.length })}
          </span>
          {totalKm > 0 && (
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {t('totalKm', { km: totalKm.toLocaleString(locale) })}
            </span>
          )}
        </div>
      </header>

      {/* Regions of this country */}
      {region.kind === 'country' && (
        <div className="mb-8 flex flex-wrap gap-2">
          {children.map((c) => (
            <Link
              key={c.slug}
              href={`/${locale}/regions/${c.slug}`}
              className="rounded-full border px-4 py-1.5 text-sm transition-colors hover:border-primary hover:text-primary"
            >
              {textFor(c.name, locale)}
              <span className="ml-1 text-muted-foreground">({childCounts.get(c.slug) ?? 0})</span>
            </Link>
          ))}
        </div>
      )}

      {routes.length > 0 ? (
        <>
          <section className="mb-10">
            <RoutesOverviewMap routes={routes} locale={locale} />
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">{t('routesHeading', { name })}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {routes.map((route) => (
                <RouteCard key={route.id} route={route} locale={locale} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-lg border p-10 text-center">
          <p className="mb-4 text-muted-foreground">{t('empty', { name })}</p>
          <Button asChild>
            <Link href={`/${locale}/submit`}>{tAll('nav.submitRoute')}</Link>
          </Button>
        </section>
      )}

      {/* Submit CTA */}
      <section className="mt-12 rounded-lg bg-gradient-brand p-8 text-center text-white">
        <h2 className="mb-2 text-2xl font-bold">{t('ctaTitle', { name })}</h2>
        <p className="mb-6 opacity-90">{t('ctaDescription')}</p>
        <Link
          href={`/${locale}/submit`}
          className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-100"
        >
          {tAll('nav.submitRoute')}
        </Link>
      </section>

      {/* Other destinations (internal links) */}
      <section className="mt-12 space-y-4">
        <h2 className="text-xl font-bold">{t('otherDestinations')}</h2>
        <div className="flex flex-wrap gap-2">
          {others.map((o) => (
            <Link
              key={o.slug}
              href={`/${locale}/regions/${o.slug}`}
              className="rounded-full border px-4 py-1.5 text-sm transition-colors hover:border-primary hover:text-primary"
            >
              {textFor(o.name, locale)}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
