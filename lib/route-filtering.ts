/**
 * Client-side filtering for the explore page. Every published route is already
 * on the page (rendered by the server), so filters run in memory: no refetch,
 * no spinner, and each option can show how many routes it would leave.
 *
 * Inside a group the options are OR (Montanha or Costeira), across groups AND.
 */

import { REGIONS, routeInRegion, textFor } from '@/lib/regions'
import type { RouteWithDetails } from '@/types'

export type FilterGroup =
  | 'category'
  | 'difficulty'
  | 'country'
  | 'region'
  | 'type'
  | 'dist'
  | 'time'
  | 'elev'
  | 'stop'
  | 'feat'

export type ExploreFilters = Partial<Record<FilterGroup, string[]>> & {
  /** Minimum MotoTrip rating (3.5, 4, 4.5) */
  rating?: number
  search?: string
}

export const FILTER_GROUPS: FilterGroup[] = [
  'category', 'difficulty', 'country', 'region', 'type', 'dist', 'time', 'elev', 'stop', 'feat',
]

type Range = { min?: number; max?: number }

/** Distance buckets in km (median route ≈ 60 km) */
export const DISTANCE_BUCKETS: Record<string, Range> = {
  short: { max: 50 },
  medium: { min: 50, max: 100 },
  long: { min: 100, max: 200 },
  epic: { min: 200 },
}

/** Riding time buckets in minutes */
export const DURATION_BUCKETS: Record<string, Range> = {
  quick: { max: 60 },
  half: { min: 60, max: 120 },
  long: { min: 120, max: 240 },
  day: { min: 240 },
}

/** Elevation gain buckets in metres */
export const ELEVATION_BUCKETS: Record<string, Range> = {
  flat: { max: 800 },
  hilly: { min: 800, max: 1500 },
  mountain: { min: 1500 },
}

export const RATING_STEPS = [3.5, 4, 4.5]

export const STOP_TYPES = ['viewpoint', 'cafe', 'restaurant', 'landmark', 'gas_station', 'accommodation'] as const

/** Highlights computed from the MotoTrip review scores */
export const HIGHLIGHTS: Record<string, (r: RouteWithDetails) => boolean> = {
  featured: (r) => !!r.featured,
  views: (r) => Number(r.curator_scenic ?? 0) >= 4.5,
  curves: (r) => Number(r.curator_fun ?? 0) >= 4.5,
  asphalt: (r) => Number(r.curator_road ?? 0) >= 4,
}

const inRange = (value: number | null | undefined, range: Range | undefined) => {
  if (!range || value == null) return false
  if (range.min != null && value < range.min) return false
  if (range.max != null && value >= range.max) return false
  return true
}

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Region slug (lib/regions) a route belongs to, if any */
export function routeRegionSlug(route: RouteWithDetails) {
  return REGIONS.find((r) => r.kind === 'region' && routeInRegion(route, r))?.slug
}

function searchText(route: RouteWithDetails, locale: string) {
  const parts = [route.title, route.region ?? '']
  for (const t of Object.values(route.translations ?? {})) if (t?.title) parts.push(t.title)
  const region = REGIONS.find((r) => r.kind === 'region' && routeInRegion(route, r))
  if (region) parts.push(textFor(region.name, locale))
  return fold(parts.join(' '))
}

/** Does `route` match one group of the filters? */
function matchesGroup(route: RouteWithDetails, group: FilterGroup, values: string[]) {
  switch (group) {
    case 'category': return values.includes(route.category)
    case 'difficulty': return values.includes(route.difficulty)
    case 'country': return !!route.country && values.includes(route.country)
    case 'region': {
      const slug = routeRegionSlug(route)
      return !!slug && values.includes(slug)
    }
    case 'type': return !!route.route_type && values.includes(route.route_type)
    case 'dist': return values.some((v) => inRange(Number(route.distance_km), DISTANCE_BUCKETS[v]))
    case 'time': return values.some((v) => inRange(route.duration_minutes, DURATION_BUCKETS[v]))
    case 'elev': return values.some((v) => inRange(route.elevation_gain_m, ELEVATION_BUCKETS[v]))
    case 'stop': return (route.stops ?? []).some((s) => values.includes(s.type))
    case 'feat': return values.every((v) => HIGHLIGHTS[v]?.(route))
  }
}

/**
 * Routes that pass every filter. `skip` leaves one group out, which is how the
 * option counts are computed (how many routes would I get if I added this?).
 */
export function filterRoutes(
  routes: RouteWithDetails[],
  filters: ExploreFilters,
  locale: string,
  skip?: FilterGroup | 'rating',
) {
  const query = filters.search ? fold(filters.search.trim()) : ''
  return routes.filter((route) => {
    if (query && !searchText(route, locale).includes(query)) return false
    if (skip !== 'rating' && filters.rating && Number(route.curator_rating ?? 0) < filters.rating) return false
    for (const group of FILTER_GROUPS) {
      if (group === skip) continue
      const values = filters[group]
      if (values?.length && !matchesGroup(route, group, values)) return false
    }
    return true
  })
}

/** How many routes each option of a group would leave */
export function countOptions(
  routes: RouteWithDetails[],
  filters: ExploreFilters,
  locale: string,
  group: FilterGroup,
  options: string[],
) {
  // Highlights combine with AND, so count against the current selection too
  const base = filterRoutes(routes, filters, locale, group === 'feat' ? undefined : group)
  return Object.fromEntries(
    options.map((o) => [
      o,
      base.filter((r) => matchesGroup(r, group, [o])).length,
    ]),
  ) as Record<string, number>
}

export function countRatings(routes: RouteWithDetails[], filters: ExploreFilters, locale: string) {
  const base = filterRoutes(routes, filters, locale, 'rating')
  return Object.fromEntries(
    RATING_STEPS.map((step) => [step, base.filter((r) => Number(r.curator_rating ?? 0) >= step).length]),
  ) as Record<number, number>
}

export const SORTS = ['recent', 'curator', 'community', 'shortest', 'longest'] as const
export type SortKey = (typeof SORTS)[number]
export const isSortKey = (v: string | null): v is SortKey => !!v && (SORTS as readonly string[]).includes(v)

const byNullsLast = (a: number | null | undefined, b: number | null | undefined) =>
  (b ?? -Infinity) - (a ?? -Infinity)
const newest = (a: RouteWithDetails, b: RouteWithDetails) => b.created_at.localeCompare(a.created_at)

export function sortRoutes(routes: RouteWithDetails[], sort: SortKey) {
  const list = [...routes]
  switch (sort) {
    case 'curator':
      return list.sort((a, b) => byNullsLast(num(a.curator_rating), num(b.curator_rating)) || newest(a, b))
    case 'community':
      return list.sort((a, b) => byNullsLast(num(a.rating_average), num(b.rating_average)) || newest(a, b))
    case 'shortest':
      return list.sort((a, b) => Number(a.distance_km) - Number(b.distance_km))
    case 'longest':
      return list.sort((a, b) => Number(b.distance_km) - Number(a.distance_km))
    default:
      return list.sort(newest)
  }
}

const num = (v: number | string | null | undefined) => (v == null ? null : Number(v))

/* ---------- URL <-> filters ---------- */

export function filtersFromParams(params: URLSearchParams): ExploreFilters {
  const filters: ExploreFilters = {}
  for (const group of FILTER_GROUPS) {
    const values = params.getAll(group).flatMap((v) => v.split(',')).filter(Boolean)
    if (values.length) filters[group] = values
  }
  // Older links used ?route_type= and ?min_rating=
  const legacyType = params.getAll('route_type')
  if (legacyType.length && !filters.type) filters.type = legacyType
  const rating = parseFloat(params.get('rating') ?? params.get('min_rating') ?? '')
  if (rating > 0 && rating <= 5) filters.rating = rating
  const search = params.get('search')
  if (search) filters.search = search
  return filters
}

export function filtersToParams(filters: ExploreFilters, sort: SortKey) {
  const params = new URLSearchParams()
  for (const group of FILTER_GROUPS) {
    filters[group]?.forEach((v) => params.append(group, v))
  }
  if (filters.rating) params.set('rating', String(filters.rating))
  if (filters.search) params.set('search', filters.search)
  if (sort !== 'recent') params.set('sort', sort)
  return params
}

/** Number of active choices (search not included) */
export function activeCount(filters: ExploreFilters) {
  return FILTER_GROUPS.reduce((n, g) => n + (filters[g]?.length ?? 0), 0) + (filters.rating ? 1 : 0)
}
