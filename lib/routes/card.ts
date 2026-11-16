/**
 * The slice of a route that listings send to the browser: route cards, the
 * explore filters and the overview map. Full routes carry the whole GPS track,
 * every stop and photo and all five translations, which made /explore ship
 * ~2.4 MB of JSON for 58 cards.
 */

import { localizeRoute } from '@/lib/localize'
import type { Route, StopType } from '@/types'

export type RouteCardData = Pick<
  Route,
  | 'id'
  | 'slug'
  | 'title'
  | 'description'
  | 'category'
  | 'difficulty'
  | 'route_type'
  | 'distance_km'
  | 'duration_minutes'
  | 'elevation_gain_m'
  | 'country'
  | 'region'
  | 'featured'
  | 'curator_rating'
  | 'curator_scenic'
  | 'curator_fun'
  | 'curator_road'
  | 'rating_average'
  | 'rating_count'
  | 'comments_count'
  | 'created_at'
  | 'thumbnail_url'
> & {
  /** Titles in every language, so search finds a route by any of them */
  translations?: Record<string, { title?: string } | undefined> | null
  /** Only the types, for the "stops" filter */
  stops?: { type: StopType | string }[] | null
  /** First point of the track as [lng, lat], for the overview map marker */
  start?: [number, number] | null
}

/** Supabase select for {@link toRouteCard}: no track, no photos, no ratings */
export const ROUTE_CARD_SELECT = `
  id, slug, title, description, translations, category, difficulty, route_type,
  distance_km, duration_minutes, elevation_gain_m, country, region, featured,
  curator_rating, curator_scenic, curator_fun, curator_road, rating_average, rating_count, comments_count,
  created_at, thumbnail_url,
  start:polyline_coordinates->coordinates->0,
  stops:route_stops(type)
`

/** Cards show two lines of description at most */
const DESCRIPTION_MAX = 220

function truncate(text: string | null, max: number) {
  if (!text || text.length <= max) return text
  const cut = text.slice(0, max)
  const space = cut.lastIndexOf(' ')
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`
}

type CardSource = Omit<RouteCardData, 'translations' | 'stops' | 'start'> & {
  translations?: unknown
  stops?: { type: string }[] | null
  start?: unknown
  polyline_coordinates?: unknown
}

function startOf(route: CardSource): [number, number] | null {
  const start =
    (route.start as [number, number] | null | undefined) ??
    (route.polyline_coordinates as { coordinates?: [number, number][] } | null | undefined)?.coordinates?.[0]
  return Array.isArray(start) && start.length >= 2 ? [Number(start[0]), Number(start[1])] : null
}

/**
 * Card data for `locale`: title and a short description already in that
 * language, titles of the other languages kept for search, everything else
 * dropped. Accepts a full route as well as a {@link ROUTE_CARD_SELECT} row.
 */
export function toRouteCard(route: CardSource, locale: string): RouteCardData {
  const localized = localizeRoute(
    { title: route.title, description: route.description, translations: route.translations, stops: null },
    locale,
  )
  const translations = Object.fromEntries(
    Object.entries((route.translations ?? {}) as Record<string, { title?: string } | null>)
      .filter(([, t]) => t?.title)
      .map(([l, t]) => [l, { title: t!.title }]),
  )

  return {
    id: route.id,
    slug: route.slug,
    title: localized.title,
    description: truncate(localized.description, DESCRIPTION_MAX),
    category: route.category,
    difficulty: route.difficulty,
    route_type: route.route_type,
    distance_km: route.distance_km,
    duration_minutes: route.duration_minutes,
    elevation_gain_m: route.elevation_gain_m,
    country: route.country,
    region: route.region,
    featured: route.featured,
    curator_rating: route.curator_rating,
    curator_scenic: route.curator_scenic,
    curator_fun: route.curator_fun,
    curator_road: route.curator_road,
    rating_average: route.rating_average,
    rating_count: route.rating_count,
    comments_count: route.comments_count ?? 0,
    created_at: route.created_at,
    thumbnail_url: route.thumbnail_url,
    translations,
    stops: route.stops ? Array.from(new Set(route.stops.map((s) => s.type)), (type) => ({ type })) : null,
    start: startOf(route),
  }
}

/**
 * Title and description of a card in `locale`. Cards from
 * {@link toRouteCard} are already localized; this also covers full routes
 * passed straight to a card (profile, blog), without touching their stops.
 */
export function localizeCard<R extends RouteCardData>(route: R, locale: string): R {
  const { title, description } = localizeRoute(
    { title: route.title, description: route.description, translations: route.translations, stops: null },
    locale,
  )
  return { ...route, title, description }
}
