import Link from 'next/link'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ChevronRight } from 'lucide-react'
import { locales } from '@/i18n'
import { RoutesService } from '@/lib/services/routes.service'
import { REGIONS, routeInRegion, textFor } from '@/lib/regions'
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

export default async function RegionsIndexPage({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'regions' })
  const routes = ((await RoutesService.getRoutes()) as RouteWithDetails[]) ?? []
  const count = (slug: string) => routes.filter((r) => routeInRegion(r, REGIONS.find((x) => x.slug === slug)!)).length
  const countries = REGIONS.filter((r) => r.kind === 'country')

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
      <header className="mb-10 max-w-3xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">{t('eyebrow')}</p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t('indexTitle')}</h1>
        <p className="text-lg text-muted-foreground">{t('indexDescription')}</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        {countries.map((country) => {
          const regions = REGIONS.filter((r) => r.kind === 'region' && r.country === country.country)
          return (
            <section key={country.slug} className="rounded-lg border bg-card p-6">
              <Link
                href={`/${locale}/regions/${country.slug}`}
                className="group mb-2 flex items-center justify-between"
              >
                <h2 className="text-2xl font-bold group-hover:text-primary">{textFor(country.name, locale)}</h2>
                <span className="flex items-center text-sm text-muted-foreground group-hover:text-primary">
                  {t('routeCount', { count: count(country.slug) })}
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
              <p className="mb-4 text-sm text-muted-foreground">{textFor(country.intro, locale)}</p>
              <ul className="divide-y">
                {regions.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/${locale}/regions/${r.slug}`}
                      className="flex items-center justify-between py-3 hover:text-primary"
                    >
                      <span className="font-medium">{textFor(r.name, locale)}</span>
                      <span className="flex items-center text-sm text-muted-foreground">
                        {count(r.slug)}
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
