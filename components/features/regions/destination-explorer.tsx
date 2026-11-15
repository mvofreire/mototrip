'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DestinationCard, type DestinationCardData } from './destination-card'

export interface ExplorerCountry {
  slug: string
  code: string
  name: string
  flag?: string
  intro: string
  count: number
  km: number
  regions: DestinationCardData[]
  /** Routes of the country whose region has no page */
  rest: { id: string; title: string; href: string }[]
}

/**
 * /regions: country tabs over a grid of region cards. Every country stays in
 * the HTML (hidden ones get `hidden`), so all destination links are crawlable.
 */
export function DestinationExplorer({ countries, locale }: { countries: ExplorerCountry[]; locale: string }) {
  const t = useTranslations('regions')
  const tAll = useTranslations()
  const [selected, setSelected] = useState<string>('all')
  const total = countries.reduce((s, c) => s + c.count, 0)

  const cardLabels = (d: DestinationCardData) => ({
    routes: t('routeCount', { count: d.count }),
    km: t('totalKm', { km: d.km.toLocaleString(locale) }),
    view: t('explore'),
    empty: t('emptyShort'),
    submit: tAll('nav.submitRoute'),
    submitHref: `/${locale}/submit`,
  })

  const tabs = [{ slug: 'all', name: t('all'), flag: '🧭', count: total }, ...countries]

  return (
    <div className="space-y-10">
      <div className="sticky top-16 z-30 -mx-4 border-b bg-background/85 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div role="tablist" aria-label={t('countryFilter')} className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {tabs.map((tab) => {
            const active = selected === tab.slug
            return (
              <button
                key={tab.slug}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setSelected(tab.slug)}
                className={cn(
                  'inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-all duration-300',
                  active
                    ? 'border-primary bg-primary text-primary-foreground shadow-[0_8px_24px_-12px_hsl(var(--primary))]'
                    : 'hover:border-[hsl(var(--primary)/0.6)] hover:text-primary',
                )}
              >
                {tab.flag && <span aria-hidden>{tab.flag}</span>}
                {tab.name}
                <span className={cn('rounded-full px-1.5 text-xs tabular-nums', active ? 'bg-white/20' : 'bg-muted text-muted-foreground')}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div key={selected} className="space-y-16">
        {countries.map((country) => (
          <section
            key={country.slug}
            id={country.slug}
            hidden={selected !== 'all' && selected !== country.slug}
            className="scroll-mt-36 space-y-6"
          >
            <div className="dest-rise flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-3xl space-y-2">
                <h2 className="font-display text-4xl font-extrabold uppercase leading-none md:text-5xl">
                  {country.flag && <span className="mr-3 align-middle text-3xl" aria-hidden>{country.flag}</span>}
                  {country.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('routeCount', { count: country.count })}
                  {country.km > 0 && <> · {t('totalKm', { km: country.km.toLocaleString(locale) })}</>}
                  {' · '}
                  {t('destinationCount', { count: country.regions.length })}
                </p>
                {country.intro && <p className="text-muted-foreground">{country.intro}</p>}
              </div>
              <Link
                href={`/${locale}/regions/${country.slug}`}
                className="group inline-flex min-h-[44px] items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
              >
                {t('viewAll', { name: country.name })}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </div>

            <div className="dest-swap grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {country.regions.map((r, i) => (
                <DestinationCard key={r.slug} data={r} labels={cardLabels(r)} index={i} />
              ))}
              {country.rest.length > 0 && (
                <article
                  style={{ '--i': country.regions.length } as React.CSSProperties}
                  className="flex flex-col gap-3 rounded-2xl border border-dashed bg-card/50 p-5"
                >
                  <h3 className="font-display text-2xl font-extrabold uppercase leading-none">{t('otherRegions')}</h3>
                  <ul className="flex flex-col gap-1 text-sm">
                    {country.rest.map((r) => (
                      <li key={r.id}>
                        <Link href={r.href} className="flex items-center gap-2 py-0.5 hover:text-primary">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                          <span className="truncate">{r.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </article>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
