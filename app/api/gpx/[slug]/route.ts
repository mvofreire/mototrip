import { RoutesService } from '@/lib/services/routes.service'
import { localizeRoute } from '@/lib/localize'
import { buildGpx, gpxFileName, routePoints, sortStops } from '@/lib/route-export'
import { locales } from '@/i18n'

// GPX file of a published route, so a plain link can download it
// (the homepage uses it; the route page builds the same file in the browser).
// GET /api/gpx/<slug>?locale=pt
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const locale = new URL(request.url).searchParams.get('locale')
  let route
  try {
    route = await RoutesService.getRouteByIdOrSlug(params.slug)
  } catch {
    route = null
  }
  const points = route ? routePoints(route.polyline_coordinates) : []
  if (!route || !route.published || points.length === 0) {
    return new Response('Not found', { status: 404 })
  }

  const localized =
    locale && (locales as readonly string[]).includes(locale) ? localizeRoute(route, locale) : route
  return new Response(buildGpx(points, localized.title, localized.description || '', sortStops(localized.stops)), {
    headers: {
      'Content-Type': 'application/gpx+xml; charset=utf-8',
      'Content-Disposition': `attachment; filename="${gpxFileName(localized.title)}"`,
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
