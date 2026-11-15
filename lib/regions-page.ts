/** Data shaping shared by the destination pages (/regions and /regions/[slug]) */

import { countryOf, textFor, type Region } from '@/lib/regions'
import { routePath } from '@/lib/route-url'
import { routePoints, routesNetworkSvg } from '@/lib/route-export'
import type { DestinationCardData } from '@/components/features/regions/destination-card'
import type { RouteWithDetails } from '@/types'

export const totalKm = (routes: RouteWithDetails[]) =>
  Math.round(routes.reduce((sum, r) => sum + Number(r.distance_km || 0), 0))

/** Featured first, then by title */
export const byFeaturedThenTitle = (a: RouteWithDetails, b: RouteWithDetails) =>
  Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title)

/** Road-network SVG paths of up to `max` routes (featured first) */
export function networkPaths(routes: RouteWithDetails[], w: number, h: number, pad: number, max = 8) {
  return routesNetworkSvg(
    routes.slice(0, max).map((r) => routePoints(r.polyline_coordinates)),
    w,
    h,
    pad,
  )
}

/** Card of a region; `routes` already localized and sorted */
export function destinationCard(region: Region, routes: RouteWithDetails[], locale: string): DestinationCardData {
  const country = countryOf(region)
  return {
    slug: region.slug,
    href: `/${locale}/regions/${region.slug}`,
    name: textFor(region.name, locale),
    countryName: country ? textFor(country.name, locale) : region.country,
    flag: region.flag,
    intro: textFor(region.intro, locale),
    count: routes.length,
    km: totalKm(routes),
    paths: networkPaths(routes, 360, 170, 18, 6),
    top: routes.slice(0, 3).map((r) => ({ id: r.id, title: r.title, href: routePath(locale, r) })),
  }
}
