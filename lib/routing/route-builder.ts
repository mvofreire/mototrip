/**
 * Geometry helpers for the map route builder: a route is a list of anchors
 * (the points the rider placed) joined by segments (the road between them).
 */
import { haversineDistance, type GPXPoint, type GPXStopType } from '@/lib/gpx-parser'
import { supabase } from '@/lib/supabase/client'

export type LatLng = { lat: number; lng: number }

export interface Anchor extends LatLng {
  id: string
}

export interface Segment {
  /** From the previous anchor to the next one, both included */
  points: GPXPoint[]
  distanceKm: number
  durationMin: number
  /** false: straight line drawn by hand (not following roads) */
  routed: boolean
}

export interface BuilderStop extends LatLng {
  id: string
  name: string
  description: string
  type: GPXStopType
}

export type RoutingError = 'no_route' | 'rate_limited' | 'unavailable'

/** Car routing is faster than a motorcycle tour (same factor as the import job) */
const DURATION_FACTOR = 1.2
/** Speed assumed for straight (off-road) segments and unknown durations */
const FALLBACK_SPEED_KMH = 50
/** Start and end closer than this make the route a loop */
const LOOP_THRESHOLD_KM = 0.5
/** Climbs smaller than this are treated as elevation noise */
const ELEVATION_NOISE_M = 5

export const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

export const distanceKm = (a: LatLng, b: LatLng) => haversineDistance(a.lat, a.lng, b.lat, b.lng)

export function lineDistanceKm(points: LatLng[]) {
  let total = 0
  for (let i = 1; i < points.length; i++) total += distanceKm(points[i - 1], points[i])
  return total
}

export function straightSegment(from: LatLng, to: LatLng): Segment {
  const km = distanceKm(from, to)
  return {
    points: [
      { lat: from.lat, lng: from.lng },
      { lat: to.lat, lng: to.lng },
    ],
    distanceKm: km,
    durationMin: (km / FALLBACK_SPEED_KMH) * 60,
    routed: false,
  }
}

/** Road segment between two points. Throws a RoutingError code on failure. */
export async function fetchRoutedSegment(from: LatLng, to: LatLng): Promise<Segment> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  let res: Response
  try {
    res = await fetch('/api/routing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({
        from: { lat: from.lat, lng: from.lng },
        to: { lat: to.lat, lng: to.lng },
      }),
    })
  } catch {
    throw 'unavailable' satisfies RoutingError
  }

  if (!res.ok) {
    const code: RoutingError =
      res.status === 404 ? 'no_route' : res.status === 429 ? 'rate_limited' : 'unavailable'
    throw code
  }

  const data = (await res.json()) as {
    coordinates: number[][]
    distanceKm: number
    durationMin: number
  }
  const points: GPXPoint[] = data.coordinates.map(([lng, lat, elevation]) =>
    typeof elevation === 'number' ? { lat, lng, elevation } : { lat, lng },
  )
  return {
    points,
    distanceKm: data.distanceKm || lineDistanceKm(points),
    durationMin: data.durationMin * DURATION_FACTOR,
    routed: true,
  }
}

export function reverseSegment(segment: Segment): Segment {
  return { ...segment, points: [...segment.points].reverse() }
}

/** Index of the segment point nearest to a position */
export function nearestPointIndex(points: LatLng[], position: LatLng) {
  let best = Infinity
  let index = 0
  points.forEach((p, i) => {
    const d = distanceKm(p, position)
    if (d < best) {
      best = d
      index = i
    }
  })
  return index
}

/**
 * Split a segment where the rider tapped on it. Returns the two halves and the
 * position of the new anchor between them.
 */
export function splitSegment(
  segment: Segment,
  position: LatLng,
): { first: Segment; second: Segment; anchor: LatLng } {
  const { points } = segment
  let index = nearestPointIndex(points, position)

  // A straight line (or a tap next to one of its ends) has no inner point to
  // split at: the tapped position becomes a new one.
  if (index === 0 || index === points.length - 1) {
    if (points.length > 2) {
      index = index === 0 ? 1 : points.length - 2
    } else {
      const mid = { lat: position.lat, lng: position.lng }
      const first = straightSegment(points[0], mid)
      const second = straightSegment(mid, points[points.length - 1])
      return { first: { ...first, routed: segment.routed }, second: { ...second, routed: segment.routed }, anchor: mid }
    }
  }

  const firstPoints = points.slice(0, index + 1)
  const secondPoints = points.slice(index)
  const firstKm = lineDistanceKm(firstPoints)
  const secondKm = lineDistanceKm(secondPoints)
  const share = firstKm + secondKm > 0 ? firstKm / (firstKm + secondKm) : 0.5
  return {
    first: {
      points: firstPoints,
      distanceKm: firstKm,
      durationMin: segment.durationMin * share,
      routed: segment.routed,
    },
    second: {
      points: secondPoints,
      distanceKm: secondKm,
      durationMin: segment.durationMin * (1 - share),
      routed: segment.routed,
    },
    anchor: { lat: points[index].lat, lng: points[index].lng },
  }
}

/** Distance from p to the segment a–b on a locally flat projection (relative units) */
function offLineDistance(p: LatLng, a: LatLng, b: LatLng) {
  const k = Math.cos((a.lat * Math.PI) / 180)
  const px = (p.lng - a.lng) * k
  const py = p.lat - a.lat
  const bx = (b.lng - a.lng) * k
  const by = b.lat - a.lat
  const len2 = bx * bx + by * by
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, (px * bx + py * by) / len2))
  return Math.hypot(px - t * bx, py - t * by)
}

/** Douglas-Peucker returning the indexes of the points that are kept */
function simplifyIndexes(points: LatLng[], tolerance: number): number[] {
  const keep = new Set<number>([0, points.length - 1])
  const stack: Array<[number, number]> = [[0, points.length - 1]]
  while (stack.length) {
    const [start, end] = stack.pop()!
    let max = 0
    let index = -1
    for (let i = start + 1; i < end; i++) {
      const d = offLineDistance(points[i], points[start], points[end])
      if (d > max) {
        max = d
        index = i
      }
    }
    if (index !== -1 && max > tolerance) {
      keep.add(index)
      stack.push([start, index], [index, end])
    }
  }
  return Array.from(keep).sort((a, b) => a - b)
}

/**
 * Turn a stored route line into editable anchors: the line is simplified
 * until at most `maxAnchors` points are left, and the original geometry
 * between them is kept as the segments.
 */
export function anchorsFromLine(
  line: GPXPoint[],
  { maxAnchors = 20, durationMin }: { maxAnchors?: number; durationMin?: number } = {},
): { anchors: Anchor[]; segments: Segment[] } {
  if (line.length < 2) return { anchors: [], segments: [] }

  let tolerance = 0.002 // ≈ 200 m
  let indexes = simplifyIndexes(line, tolerance)
  while (indexes.length > maxAnchors) {
    tolerance *= 1.6
    indexes = simplifyIndexes(line, tolerance)
  }

  const totalKm = lineDistanceKm(line)
  const totalMin = durationMin ?? (totalKm / FALLBACK_SPEED_KMH) * 60
  const anchors = indexes.map((i) => ({ id: newId(), lat: line[i].lat, lng: line[i].lng }))
  const segments = indexes.slice(1).map((end, n) => {
    const points = line.slice(indexes[n], end + 1)
    const km = lineDistanceKm(points)
    return {
      points,
      distanceKm: km,
      durationMin: totalKm > 0 ? (totalMin * km) / totalKm : 0,
      routed: true,
    }
  })
  return { anchors, segments }
}

/** The whole route as one line (segment joints are not repeated) */
export function segmentsToLine(segments: Segment[]): GPXPoint[] {
  return segments.flatMap((s, i) => (i === 0 ? s.points : s.points.slice(1)))
}

/** Positive climb, ignoring small ups and downs. null when elevation is missing. */
export function elevationGain(points: GPXPoint[]): number | null {
  if (points.length < 2 || points.some((p) => p.elevation === undefined)) return null
  let gain = 0
  let reference = points[0].elevation!
  for (const p of points) {
    const diff = p.elevation! - reference
    if (diff >= ELEVATION_NOISE_M) {
      gain += diff
      reference = p.elevation!
    } else if (diff <= -ELEVATION_NOISE_M) {
      reference = p.elevation!
    }
  }
  return gain
}

export interface RouteDraft {
  points: GPXPoint[]
  distanceKm: number
  durationMin: number
  /** null when part of the route has no elevation data */
  elevationGainM: number | null
  isLoop: boolean
  stops: BuilderStop[]
}

export function buildDraft(anchors: Anchor[], segments: Segment[], stops: BuilderStop[]): RouteDraft {
  const points = segmentsToLine(segments)
  return {
    points,
    distanceKm: segments.reduce((sum, s) => sum + s.distanceKm, 0),
    durationMin: segments.reduce((sum, s) => sum + s.durationMin, 0),
    elevationGainM: elevationGain(points),
    isLoop:
      anchors.length > 2 && distanceKm(anchors[0], anchors[anchors.length - 1]) < LOOP_THRESHOLD_KM,
    stops,
  }
}
