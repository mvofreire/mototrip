/**
 * Destination landing pages (/[locale]/regions/[slug]). Each one lists the
 * published routes of a country or region, so search engines have a page for
 * queries like "rotas de moto no Algarve".
 *
 * The list comes from the `countries` and `regions` tables (see
 * lib/regions.server.ts). The helpers below are synchronous and read the
 * catalog loaded for this request: server code calls `await loadRegions()`
 * first, client components get it from <RegionsHydrator> in the layout.
 */

import { FALLBACK_REGIONS } from './regions-fallback'

export type Locale = 'pt' | 'en' | 'es' | 'fr' | 'de'
export type Text = Partial<Record<Locale, string>> & Record<string, string | undefined>

export interface Region {
  slug: string
  /** ISO 3166-1 alpha-2, as in routes.country */
  country: string
  /** A whole country, or a region inside it */
  kind: 'country' | 'region'
  /** `routes.region` values that belong to this region (case-insensitive) */
  match: string[]
  name: Text
  /** Paragraph under the title; staff-created regions may not have one yet */
  intro?: Text | null
  flag?: string
}

export type CountryRow = { code: string; flag: string; name: Text; slug: string | null; intro: Text | null; sort_order: number }
export type RegionRow = {
  country: string
  route_region: string
  aliases: string[] | null
  name: Text
  slug: string | null
  intro: Text | null
  sort_order: number
}

/** Rows → catalog: each country (by sort_order) followed by its regions */
export function buildCatalog(countries: CountryRow[], regions: RegionRow[]): Region[] {
  const bySort = <T extends { sort_order: number }>(a: T, b: T) => a.sort_order - b.sort_order
  const out: Region[] = []
  for (const c of [...countries].sort(bySort)) {
    if (!c.slug) continue
    out.push({ slug: c.slug, country: c.code, kind: 'country', match: [], name: c.name, intro: c.intro, flag: c.flag })
    const children = regions
      .filter((r) => r.country === c.code && r.slug)
      .sort((a, b) => bySort(a, b) || a.route_region.localeCompare(b.route_region))
    for (const r of children) {
      out.push({
        slug: r.slug!,
        country: r.country,
        kind: 'region',
        match: [r.route_region, ...(r.aliases ?? [])],
        name: r.name,
        intro: r.intro,
        flag: c.flag,
      })
    }
  }
  return out
}

let catalog: Region[] = FALLBACK_REGIONS

/** Replace the catalog (server loader and client hydrator) */
export function setRegions(regions: Region[]) {
  if (regions.length) catalog = regions
}

/** Countries and regions in display order: each country followed by its regions */
export function getRegions() {
  return catalog
}

export function getRegion(slug: string, regions = catalog) {
  return regions.find((r) => r.slug === slug)
}

/** Country page of a region (or the country itself) */
export function countryOf(region: Pick<Region, 'country'>, regions = catalog) {
  return regions.find((r) => r.kind === 'country' && r.country === region.country)
}

/** Regions inside a country, in display order */
export function regionsOf(country: string, regions = catalog) {
  return regions.filter((r) => r.kind === 'region' && r.country === country)
}

export function textFor(text: Text | null | undefined, locale: string) {
  if (!text) return ''
  return text[locale] ?? text.en ?? text.pt ?? Object.values(text).find(Boolean) ?? ''
}

const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase()

/** Does a route belong to this region/country page? */
export function routeInRegion(
  route: { country: string | null; region: string | null },
  region: Region,
) {
  if (region.kind === 'country') return route.country === region.country
  return route.country === region.country && region.match.some((m) => norm(m) === norm(route.region))
}

/** Region page a route belongs to (most specific first) */
export function regionForRoute(route: { country: string | null; region: string | null }, regions = catalog) {
  return (
    regions.find((r) => r.kind === 'region' && routeInRegion(route, r)) ??
    regions.find((r) => r.kind === 'country' && routeInRegion(route, r))
  )
}

/** Region name in the page's language (the raw routes.region when it has no page) */
export function regionLabel(
  route: { country: string | null; region: string | null },
  locale: string,
  regions = catalog,
) {
  const region = regions.find((r) => r.kind === 'region' && routeInRegion(route, r))
  return region ? textFor(region.name, locale) : route.region
}
