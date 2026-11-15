/**
 * Values the submit wizard fills in from the route's track (a GPX file or a
 * line drawn in the route builder). The rider and the curator can change
 * every one of them; these are only the starting point.
 */

import { haversineDistance, type GPXPoint } from '@/lib/gpx-parser'

export type Difficulty = 'easy' | 'moderate' | 'challenging' | 'expert'
export type Category = 'scenic' | 'mountain' | 'coastal' | 'weekend' | 'adventure'
export type RouteType = 'loop' | 'out_and_back'

export interface TrackFacts {
  distanceKm: number
  durationMin: number
  elevationGainM: number
  maxElevationM: number | null
  /** Bends per km (heading changes of 30°+ every ~100 m) */
  curvesPerKm: number
  /** Distance between the first and the last point */
  endGapKm: number
}

/** Start and end closer than this make a loop (same value as the route builder) */
const LOOP_KM = 1.5
/** Average touring speed when the GPX has no usable timestamps */
const TOUR_SPEED_KMH = 40

const round5 = (min: number) => Math.max(5, Math.round(min / 5) * 5)

function bearing(a: GPXPoint, b: GPXPoint) {
  const toRad = Math.PI / 180
  const y = Math.sin((b.lng - a.lng) * toRad) * Math.cos(b.lat * toRad)
  const x =
    Math.cos(a.lat * toRad) * Math.sin(b.lat * toRad) -
    Math.sin(a.lat * toRad) * Math.cos(b.lat * toRad) * Math.cos((b.lng - a.lng) * toRad)
  return Math.atan2(y, x) / toRad
}

/** Points roughly `stepKm` apart, so curve counting doesn't depend on GPS density */
function resample(points: GPXPoint[], stepKm: number) {
  const out: GPXPoint[] = points.length ? [points[0]] : []
  let acc = 0
  for (let i = 1; i < points.length; i++) {
    acc += haversineDistance(points[i - 1].lat, points[i - 1].lng, points[i].lat, points[i].lng)
    if (acc >= stepKm) {
      out.push(points[i])
      acc = 0
    }
  }
  return out
}

export function countCurvesPerKm(points: GPXPoint[], distanceKm: number) {
  if (distanceKm <= 0) return 0
  const pts = resample(points, 0.1)
  let curves = 0
  for (let i = 2; i < pts.length; i++) {
    let d = Math.abs(bearing(pts[i - 1], pts[i]) - bearing(pts[i - 2], pts[i - 1]))
    if (d > 180) d = 360 - d
    if (d >= 30) curves++
  }
  return Math.round((curves / distanceKm) * 10) / 10
}

/** Riding time from the GPX timestamps, when they look like a real ride */
function recordedDurationMin(points: GPXPoint[], distanceKm: number) {
  const first = points.find((p) => p.time)?.time
  const last = [...points].reverse().find((p) => p.time)?.time
  if (!first || !last) return null
  const min = (last.getTime() - first.getTime()) / 60000
  const speed = distanceKm / (min / 60)
  // Planned routes from some apps carry fake times; ignore implausible speeds
  return min > 0 && speed >= 15 && speed <= 110 ? min : null
}

export function estimateDurationMin(points: GPXPoint[], distanceKm: number) {
  return round5(recordedDurationMin(points, distanceKm) ?? (distanceKm / TOUR_SPEED_KMH) * 60)
}

export function trackFacts(
  points: GPXPoint[],
  given: { distanceKm: number; elevationGainM: number | null; durationMin?: number },
): TrackFacts {
  const elevations = points.map((p) => p.elevation).filter((e): e is number => e !== undefined)
  const first = points[0]
  const last = points[points.length - 1]
  const distanceKm = Math.max(1, Math.round(given.distanceKm))
  return {
    distanceKm,
    durationMin: given.durationMin ? round5(given.durationMin) : estimateDurationMin(points, distanceKm),
    elevationGainM: Math.round(given.elevationGainM ?? 0),
    maxElevationM: elevations.length ? Math.round(Math.max(...elevations)) : null,
    curvesPerKm: countCurvesPerKm(points, distanceKm),
    endGapKm:
      first && last ? Math.round(haversineDistance(first.lat, first.lng, last.lat, last.lng) * 10) / 10 : 0,
  }
}

export function suggestRouteType(f: TrackFacts): RouteType {
  return f.endGapKm < LOOP_KM ? 'loop' : 'out_and_back'
}

/** Climb per km and bends per km, weighted into four bands */
export function suggestDifficulty(f: TrackFacts): Difficulty {
  const climbPerKm = f.elevationGainM / Math.max(f.distanceKm, 1)
  const score = climbPerKm + f.curvesPerKm * 1.2
  if (score < 12) return 'easy'
  if (score < 26) return 'moderate'
  if (score < 40) return 'challenging'
  return 'expert'
}

/** Mountain when it climbs high or a lot; otherwise scenic. Coastal etc. are the rider's call */
export function suggestCategory(f: TrackFacts): Category {
  const climbPerKm = f.elevationGainM / Math.max(f.distanceKm, 1)
  return (f.maxElevationM ?? 0) > 1200 || climbPerKm > 25 ? 'mountain' : 'scenic'
}

/**
 * Route title in the site's pattern: "Name | Start > Stop > End".
 * Repeated places (a loop's start and end) are written once.
 */
export function buildRouteTitle(name: string, places: (string | null | undefined)[]) {
  const via = titlePlaces(places)
  const head = name.trim()
  if (!via.length) return head
  return `${head} | ${via.join(' > ')}`
}

/** Places of the title, blanks dropped and repeats in a row written once */
export function titlePlaces(places: (string | null | undefined)[]) {
  return places
    .map((p) => p?.trim())
    .filter((p): p is string => !!p)
    .filter((p, i, all) => i === 0 || p.toLowerCase() !== all[i - 1].toLowerCase())
}

export interface RegionBox {
  id: string
  country: string
  bbox: number[] | null
}

/**
 * Smallest region whose box holds the point. Boxes are rough and overlap at
 * borders (the French and Spanish Pyrenees), so when the country of the point
 * is known only that country's regions count.
 */
export function regionAt<T extends RegionBox>(
  regions: T[],
  point: { lat: number; lng: number },
  country?: string | null,
) {
  const area = (b: number[]) => (b[2] - b[0]) * (b[3] - b[1])
  return regions
    .filter(
      (r): r is T & { bbox: number[] } =>
        (!country || r.country === country) &&
        !!r.bbox &&
        r.bbox.length === 4 &&
        point.lng >= r.bbox[0] &&
        point.lat >= r.bbox[1] &&
        point.lng <= r.bbox[2] &&
        point.lat <= r.bbox[3],
    )
    .sort((a, b) => area(a.bbox) - area(b.bbox))[0]
}

/** Where a point sits along the track: km from the start and distance off it */
export function positionOnTrack(points: GPXPoint[], p: { lat: number; lng: number }) {
  let km = 0
  let bestKm = 0
  let bestOff = Infinity
  for (let i = 0; i < points.length; i++) {
    if (i > 0) km += haversineDistance(points[i - 1].lat, points[i - 1].lng, points[i].lat, points[i].lng)
    const off = haversineDistance(p.lat, p.lng, points[i].lat, points[i].lng)
    if (off < bestOff) {
      bestOff = off
      bestKm = km
    }
  }
  return { km: Math.round(bestKm), offRouteKm: Math.round(bestOff * 10) / 10 }
}

/** Generic names apps give tracks ("Track 1", "2026-05-01 10:22") aren't route names */
export function usableTrackName(name: string | undefined) {
  const n = name?.trim()
  if (!n || n.length < 3 || n.length > 40) return null
  if (/^(track|trk|route|rte|activity|ride|untitled|new)\b/i.test(n) || /^\d/.test(n)) return null
  return n.split('|')[0].trim()
}
