import type { RouteWithDetails } from '@/types'
import { getSiteUrl } from '@/lib/site-url'
import { routePath } from '@/lib/route-url'
import { REGIONS, regionForRoute, textFor } from '@/lib/regions'

type Labels = {
  destinations: string
  distance: string
  duration: string
  elevation: string
}

const iso8601Duration = (minutes: number) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `PT${h ? `${h}H` : ''}${m || !h ? `${m}M` : ''}`
}

/**
 * schema.org data for a public route page:
 * - TouristTrip with its stops as the itinerary
 * - BreadcrumbList Destinations › Country › Region › Route (shown by Google
 *   in place of the URL in search results)
 */
export function routeStructuredData(route: RouteWithDetails, locale: string, labels: Labels) {
  const base = getSiteUrl()
  const url = `${base}${routePath(locale, route)}`
  const region = regionForRoute(route)
  const country = region && REGIONS.find((r) => r.kind === 'country' && r.country === region.country)
  const photos = [...(route.photos ?? [])].sort((a, b) => a.order_index - b.order_index).map((p) => p.url)
  const images = [...photos, route.thumbnail_url].filter((u): u is string => !!u)
  const stops = [...(route.stops ?? [])].sort((a, b) => a.order_index - b.order_index)
  const coords = (route.polyline_coordinates?.coordinates ?? []) as [number, number][]

  const ratings = route.ratings ?? []
  const avg =
    ratings.length > 0
      ? ratings.reduce(
          (s, r) => s + (Number(r.scenic_rating) + Number(r.road_quality_rating) + Number(r.fun_factor_rating)) / 3,
          0,
        ) / ratings.length
      : null

  const trip: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    '@id': `${url}#trip`,
    name: route.title,
    url,
    description: route.description ?? undefined,
    image: images.length ? images : undefined,
    touristType: 'Motorcyclists',
    inLanguage: locale,
    dateModified: route.updated_at,
    provider: { '@type': 'Organization', name: 'MotoTrip', url: base },
    // Distance / duration / elevation as readable properties
    additionalProperty: [
      { '@type': 'PropertyValue', name: labels.distance, value: Number(route.distance_km), unitCode: 'KMT', unitText: 'km' },
      {
        '@type': 'PropertyValue',
        name: labels.duration,
        value: iso8601Duration(route.duration_minutes),
      },
      ...(route.elevation_gain_m
        ? [{ '@type': 'PropertyValue', name: labels.elevation, value: route.elevation_gain_m, unitCode: 'MTR', unitText: 'm' }]
        : []),
    ],
    ...(coords.length > 1
      ? {
          tripOrigin: {
            '@type': 'Place',
            geo: { '@type': 'GeoCoordinates', latitude: coords[0][1], longitude: coords[0][0] },
          },
        }
      : {}),
    ...(region
      ? {
          contentLocation: {
            '@type': 'Place',
            name: textFor(region.name, locale),
            address: { '@type': 'PostalAddress', addressCountry: region.country },
          },
        }
      : {}),
    ...(stops.length
      ? {
          itinerary: {
            '@type': 'ItemList',
            numberOfItems: stops.length,
            itemListElement: stops.map((s, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'TouristAttraction',
                name: s.name,
                description: s.description ?? undefined,
                geo: { '@type': 'GeoCoordinates', latitude: Number(s.latitude), longitude: Number(s.longitude) },
              },
            })),
          },
        }
      : {}),
    ...(avg !== null
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Math.round(avg * 10) / 10,
            bestRating: 10,
            worstRating: 0,
            ratingCount: ratings.length,
          },
        }
      : {}),
  }

  const crumbs = [
    { name: labels.destinations, item: `${base}/${locale}/regions` },
    ...(country ? [{ name: textFor(country.name, locale), item: `${base}/${locale}/regions/${country.slug}` }] : []),
    ...(region && region.kind === 'region'
      ? [{ name: textFor(region.name, locale), item: `${base}/${locale}/regions/${region.slug}` }]
      : []),
    { name: route.title, item: url },
  ]
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, ...c })),
  }

  return [trip, breadcrumb]
}
