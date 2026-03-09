/**
 * GPX Parser Utility
 * Parses GPX files and extracts route information
 */

export interface GPXPoint {
  lat: number
  lng: number
  elevation?: number
  time?: Date
}

export interface GPXData {
  points: GPXPoint[]
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
  totalDistance: number // in kilometers
  elevationGain: number // in meters
  elevationLoss: number // in meters
  minElevation?: number
  maxElevation?: number
}

/**
 * Parse a GPX file and extract route data
 */
export async function parseGPXFile(file: File): Promise<GPXData> {
  const text = await file.text()
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(text, 'text/xml')

  // Check for parsing errors
  const parserError = xmlDoc.querySelector('parsererror')
  if (parserError) {
    throw new Error('Invalid GPX file format')
  }

  // Extract track points (trkpt) or route points (rtept)
  const trackPoints = xmlDoc.querySelectorAll('trkpt')
  const routePoints = xmlDoc.querySelectorAll('rtept')
  const points = trackPoints.length > 0 ? trackPoints : routePoints

  if (points.length === 0) {
    throw new Error('No route or track points found in GPX file')
  }

  const gpxPoints: GPXPoint[] = []
  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity
  let minElevation = Infinity
  let maxElevation = -Infinity
  let hasElevation = false

  // Parse each point
  points.forEach((point) => {
    const lat = parseFloat(point.getAttribute('lat') || '0')
    const lng = parseFloat(point.getAttribute('lon') || '0')
    
    const eleElement = point.querySelector('ele')
    const timeElement = point.querySelector('time')
    
    const gpxPoint: GPXPoint = { lat, lng }
    
    if (eleElement) {
      gpxPoint.elevation = parseFloat(eleElement.textContent || '0')
      hasElevation = true
      minElevation = Math.min(minElevation, gpxPoint.elevation)
      maxElevation = Math.max(maxElevation, gpxPoint.elevation)
    }
    
    if (timeElement && timeElement.textContent) {
      gpxPoint.time = new Date(timeElement.textContent)
    }

    gpxPoints.push(gpxPoint)

    // Update bounds
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
  })

  // Calculate total distance
  const totalDistance = calculateTotalDistance(gpxPoints)

  // Calculate elevation gain and loss
  const { gain, loss } = calculateElevationChange(gpxPoints)

  return {
    points: gpxPoints,
    bounds: {
      north: maxLat,
      south: minLat,
      east: maxLng,
      west: minLng,
    },
    totalDistance,
    elevationGain: gain,
    elevationLoss: loss,
    minElevation: hasElevation ? minElevation : undefined,
    maxElevation: hasElevation ? maxElevation : undefined,
  }
}

/**
 * Calculate total distance along the route using Haversine formula
 */
function calculateTotalDistance(points: GPXPoint[]): number {
  let totalDistance = 0

  for (let i = 1; i < points.length; i++) {
    totalDistance += haversineDistance(
      points[i - 1].lat,
      points[i - 1].lng,
      points[i].lat,
      points[i].lng
    )
  }

  return totalDistance
}

/**
 * Haversine distance formula
 * Returns distance in kilometers
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Calculate elevation gain and loss
 */
function calculateElevationChange(points: GPXPoint[]): {
  gain: number
  loss: number
} {
  let gain = 0
  let loss = 0

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]

    if (prev.elevation !== undefined && curr.elevation !== undefined) {
      const diff = curr.elevation - prev.elevation
      if (diff > 0) {
        gain += diff
      } else {
        loss += Math.abs(diff)
      }
    }
  }

  return { gain, loss }
}

/**
 * Convert GPX points to GeoJSON LineString coordinates
 */
export function gpxPointsToGeoJSON(points: GPXPoint[]) {
  return {
    type: 'LineString' as const,
    coordinates: points.map(p => [p.lng, p.lat]),
  }
}

/**
 * Simplify a route by reducing the number of points
 * Uses Douglas-Peucker algorithm
 */
export function simplifyRoute(points: GPXPoint[], tolerance: number = 0.0001): GPXPoint[] {
  if (points.length <= 2) return points

  // Find the point with maximum distance from the line between first and last
  let maxDistance = 0
  let maxIndex = 0

  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]

  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(
      points[i],
      firstPoint,
      lastPoint
    )
    if (distance > maxDistance) {
      maxDistance = distance
      maxIndex = i
    }
  }

  // If max distance is greater than tolerance, recursively simplify
  if (maxDistance > tolerance) {
    const leftSegment = simplifyRoute(points.slice(0, maxIndex + 1), tolerance)
    const rightSegment = simplifyRoute(points.slice(maxIndex), tolerance)

    // Concatenate results, removing duplicate point at junction
    return [...leftSegment.slice(0, -1), ...rightSegment]
  } else {
    return [firstPoint, lastPoint]
  }
}

/**
 * Calculate perpendicular distance from a point to a line
 */
function perpendicularDistance(
  point: GPXPoint,
  lineStart: GPXPoint,
  lineEnd: GPXPoint
): number {
  const numerator = Math.abs(
    (lineEnd.lng - lineStart.lng) * (lineStart.lat - point.lat) -
    (lineStart.lng - point.lng) * (lineEnd.lat - lineStart.lat)
  )
  
  const denominator = Math.sqrt(
    Math.pow(lineEnd.lng - lineStart.lng, 2) +
    Math.pow(lineEnd.lat - lineStart.lat, 2)
  )

  return denominator === 0 ? 0 : numerator / denominator
}
