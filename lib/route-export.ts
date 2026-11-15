import { escapeXml } from '@/lib/utils'

export type LatLng = { lat: number; lng: number }

/** Route line as {lat, lng} points (polyline_coordinates is a GeoJSON LineString) */
export function routePoints(polyline: unknown): LatLng[] {
  const coords = (polyline as { coordinates?: [number, number][] } | null)?.coordinates
  return coords?.map(([lng, lat]) => ({ lat, lng })) ?? []
}

/** Stops in riding order (the database returns them unordered) */
export function sortStops<T extends { order_index: number }>(stops: T[] | null | undefined): T[] {
  return stops ? [...stops].sort((a, b) => a.order_index - b.order_index) : []
}

export type GpxStop = { name: string; description?: string | null; latitude: number; longitude: number }

/** GPX 1.1 track of a route, with its stops as waypoints */
export function buildGpx(points: LatLng[], title: string, description = '', stops: GpxStop[] = []) {
  const track = points.map((p) => `      <trkpt lat="${p.lat}" lon="${p.lng}"></trkpt>`).join('\n')
  const wpts = stops
    .map(
      (s) =>
        `  <wpt lat="${Number(s.latitude)}" lon="${Number(s.longitude)}">\n    <name>${escapeXml(s.name)}</name>` +
        (s.description ? `\n    <desc>${escapeXml(s.description)}</desc>` : '') +
        `\n  </wpt>\n`,
    )
    .join('')
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="MotoTrip" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(title)}</name>
    <desc>${escapeXml(description)}</desc>
  </metadata>
${wpts}  <trk>
    <name>${escapeXml(title)}</name>
    <trkseg>
${track}
    </trkseg>
  </trk>
</gpx>`
}

/** File name for a route's GPX: "Col du Galibier | Télégraphe" → "col-du-galibier-telegraphe.gpx" */
export function gpxFileName(title: string) {
  const slug = title
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${slug || 'route'}.gpx`
}

/** Google Maps directions from start to end through a few points of the route */
export function googleMapsUrl(points: LatLng[]) {
  if (points.length === 0) return null
  const start = points[0]
  const end = points[points.length - 1]
  const sampled = points.filter((_, i) => i % Math.ceil(points.length / 8) === 0)
  const waypoints = sampled
    .slice(1, -1)
    .map((p) => `${p.lat},${p.lng}`)
    .join('|')
  return (
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${start.lat},${start.lng}` +
    `&destination=${end.lat},${end.lng}` +
    `&waypoints=${waypoints}` +
    `&travelmode=driving`
  )
}

/** Google Maps turn-by-turn from the rider's current location to one point */
export function googleMapsStopUrl(p: LatLng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=driving&dir_action=navigate`
}

/**
 * SVG path `d` of the route line fitted (aspect-correct) into a w×h box, with
 * at most `maxPoints` points, for light previews that don't need a map.
 */
export function routeSvgPath(points: LatLng[], w: number, h: number, pad = 16, maxPoints = 120) {
  if (points.length < 2) return null
  const step = Math.max(1, Math.ceil(points.length / maxPoints))
  const pts = points.filter((_, i) => i % step === 0 || i === points.length - 1)
  // Equirectangular, longitude scaled by the latitude
  const k = Math.cos((pts.reduce((s, p) => s + p.lat, 0) / pts.length) * (Math.PI / 180))
  const xs = pts.map((p) => p.lng * k)
  const ys = pts.map((p) => -p.lat)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const scale = Math.min((w - pad * 2) / (maxX - minX || 1), (h - pad * 2) / (maxY - minY || 1))
  const offX = (w - (maxX - minX) * scale) / 2
  const offY = (h - (maxY - minY) * scale) / 2
  return xs
    .map((x, i) => {
      const px = (offX + (x - minX) * scale).toFixed(1)
      const py = (offY + (ys[i] - minY) * scale).toFixed(1)
      return `${i === 0 ? 'M' : 'L'}${px} ${py}`
    })
    .join(' ')
}

/**
 * Several routes drawn on one shared projection (a region's road network), so
 * their relative positions are kept. Returns one SVG path per route with ≥ 2 points.
 */
export function routesNetworkSvg(routes: LatLng[][], w: number, h: number, pad = 16, maxPoints = 80) {
  const lines = routes.filter((pts) => pts.length >= 2)
  if (!lines.length) return []
  const all = lines.flat()
  const k = Math.cos((all.reduce((s, p) => s + p.lat, 0) / all.length) * (Math.PI / 180))
  const xs = all.map((p) => p.lng * k)
  const ys = all.map((p) => -p.lat)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const scale = Math.min((w - pad * 2) / (maxX - minX || 1), (h - pad * 2) / (maxY - minY || 1))
  const offX = (w - (maxX - minX) * scale) / 2
  const offY = (h - (maxY - minY) * scale) / 2
  return lines.map((pts) => {
    const step = Math.max(1, Math.ceil(pts.length / maxPoints))
    return pts
      .filter((_, i) => i % step === 0 || i === pts.length - 1)
      .map((p, i) => {
        const px = (offX + (p.lng * k - minX) * scale).toFixed(1)
        const py = (offY + (-p.lat - minY) * scale).toFixed(1)
        return `${i === 0 ? 'M' : 'L'}${px} ${py}`
      })
      .join(' ')
  })
}
