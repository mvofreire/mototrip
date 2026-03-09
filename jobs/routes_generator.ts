/**
 * Motorcycle Routes Generator
 * 
 * This script automatically generates high-quality motorcycle touring routes
 * using OpenStreetMap data and saves them to Supabase.
 * 
 * Usage: npx tsx jobs/routes_generator.ts
 */

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as turf from '@turf/turf';
import pLimit from 'p-limit';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { Database } from '../types/database.types';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

// ================================================================================
// CONFIGURATION
// ================================================================================

const SYSTEM_USER_ID = 'c8e0d98d-6270-45cd-be0b-2e9ca8c97135'; // Placeholder system user
// const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000001'; // Placeholder system user
const TARGET_ROUTES_COUNT = 100;
const MIN_DISTANCE_KM = 30;
const MAX_DISTANCE_KM = 400;
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';
const CONCURRENCY_LIMIT = 5;

// Portugal bounding box for initial route generation
// Split Norte into smaller regions to avoid Overpass API timeouts
const REGIONS = [
  { name: 'Norte-West', bbox: [41.0, -8.9, 41.6, -7.5] }, // lat_min, lon_min, lat_max, lon_max
  { name: 'Norte-East', bbox: [41.0, -7.5, 41.6, -6.2] },
  { name: 'Norte-North', bbox: [41.6, -8.9, 42.2, -6.2] },
  { name: 'Centro', bbox: [39.5, -9.5, 41.0, -6.8] },
  { name: 'Alentejo', bbox: [37.5, -9.0, 39.5, -7.0] },
  { name: 'Algarve', bbox: [36.9, -9.0, 37.5, -7.4] },
];

// ================================================================================
// TYPES
// ================================================================================

interface OSMNode {
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

interface OSMWay {
  id: number;
  nodes: number[];
  tags: Record<string, string>;
  geometry?: Array<{ lat: number; lon: number }>; // Added by 'out geom'
}

interface OSMData {
  elements: (OSMNode | OSMWay)[];
}

interface RoutePoint {
  lat: number;
  lon: number;
  elevation?: number;
}

interface GeneratedRoute {
  points: RoutePoint[];
  distance_km: number;
  curviness: number;
  elevation_gain_m: number;
  region: string;
  category: Database['public']['Tables']['routes']['Row']['category'];
  difficulty: Database['public']['Tables']['routes']['Row']['difficulty'];
}

interface RouteStop {
  name: string;
  description: string | null;
  type: Database['public']['Tables']['route_stops']['Row']['type'];
  latitude: number;
  longitude: number;
  order_index: number;
}

// ================================================================================
// SUPABASE CLIENT
// ================================================================================

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ================================================================================
// LOGGING
// ================================================================================

const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
  },
  success: (message: string, ...args: any[]) => {
    console.log(`[SUCCESS] ${new Date().toISOString()} - ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
  },
};

// ================================================================================
// OVERPASS API - FETCH ROAD NETWORK
// ================================================================================

async function fetchRoadNetwork(bbox: number[], retries = 3): Promise<OSMData> {
  const [latMin, lonMin, latMax, lonMax] = bbox;
  
  // Overpass QL query for scenic motorcycle roads
  const query = `
    [out:json][timeout:60];
    (
      way["highway"="secondary"](${latMin},${lonMin},${latMax},${lonMax});
      way["highway"="tertiary"](${latMin},${lonMin},${latMax},${lonMax});
      way["highway"="unclassified"](${latMin},${lonMin},${latMax},${lonMax});
    );
    out geom;
  `;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
        logger.info(`Retry attempt ${attempt}/${retries} after ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      logger.info(`Fetching road network for bbox: [${bbox.join(', ')}]`);
      
      const response = await axios.post<OSMData>(
        OVERPASS_API_URL,
        query,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 90000, // 90 seconds
        }
      );

      const wayCount = response.data.elements.filter(e => 'nodes' in e).length;
      logger.success(`Fetched ${wayCount} road segments`);
      
      return response.data;
    } catch (error) {
      const isLastAttempt = attempt === retries;
      const isTimeout = axios.isAxiosError(error) && (error.code === 'ECONNABORTED' || error.response?.status === 504);
      
      if (isTimeout && !isLastAttempt) {
        logger.warn(`Request timeout (attempt ${attempt + 1}/${retries + 1}), will retry...`);
        continue;
      }
      
      logger.error('Failed to fetch road network:', error);
      throw error;
    }
  }
  
  throw new Error('Should not reach here');
}

// ================================================================================
// GEOSPATIAL CALCULATIONS
// ================================================================================

/**
 * Calculate curviness score based on directional changes
 */
function calculateCurviness(points: RoutePoint[]): number {
  if (points.length < 3) return 0;

  let totalAngleChange = 0;
  let segmentCount = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const p1 = turf.point([points[i - 1].lon, points[i - 1].lat]);
    const p2 = turf.point([points[i].lon, points[i].lat]);
    const p3 = turf.point([points[i + 1].lon, points[i + 1].lat]);

    const bearing1 = turf.bearing(p1, p2);
    const bearing2 = turf.bearing(p2, p3);

    let angleDiff = Math.abs(bearing2 - bearing1);
    if (angleDiff > 180) angleDiff = 360 - angleDiff;

    totalAngleChange += angleDiff;
    segmentCount++;
  }

  // Normalize to 0-10 scale (higher = curvier)
  const avgAngleChange = totalAngleChange / segmentCount;
  return Math.min(10, (avgAngleChange / 20) * 10);
}

/**
 * Calculate elevation gain using simplified terrain model
 */
function calculateElevationGain(points: RoutePoint[]): number {
  // Since we don't have real elevation data from Overpass,
  // we'll estimate based on region and distance
  // In production, you would use a DEM service like OpenTopoData
  
  // Simple heuristic: assume some elevation change
  const totalDistance = calculateDistance(points);
  return Math.floor(totalDistance * 8); // ~8m per km average
}

/**
 * Calculate total distance of route in kilometers
 */
function calculateDistance(points: RoutePoint[]): number {
  if (points.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const from = turf.point([points[i].lon, points[i].lat]);
    const to = turf.point([points[i + 1].lon, points[i + 1].lat]);
    totalDistance += turf.distance(from, to, { units: 'kilometers' });
  }

  return totalDistance;
}

/**
 * Check if route forms a valid loop
 */
function isValidLoop(points: RoutePoint[]): boolean {
  if (points.length < 10) return false;

  const start = turf.point([points[0].lon, points[0].lat]);
  const end = turf.point([points[points.length - 1].lon, points[points.length - 1].lat]);
  
  const closingDistance = turf.distance(start, end, { units: 'kilometers' });
  
  // Loop should close within 10km
  return closingDistance < 10;
}

// ================================================================================
// ROUTE GENERATION
// ================================================================================

/**
 * Generate loop routes from OSM road network
 */
function generateLoopRoutes(osmData: OSMData, region: string, targetCount: number): GeneratedRoute[] {
  const routes: GeneratedRoute[] = [];
  
  // Build node lookup
  const nodeMap = new Map<number, OSMNode>();
  const ways: OSMWay[] = [];
  
  for (const element of osmData.elements) {
    if ('nodes' in element) {
      const way = element as OSMWay;
      ways.push(way);
      
      // If geometry is included (from 'out geom'), create nodes from geometry
      if (way.geometry && way.geometry.length > 0) {
        for (let i = 0; i < way.nodes.length && i < way.geometry.length; i++) {
          if (!nodeMap.has(way.nodes[i])) {
            nodeMap.set(way.nodes[i], {
              id: way.nodes[i],
              lat: way.geometry[i].lat,
              lon: way.geometry[i].lon
            });
          }
        }
      }
    } else {
      nodeMap.set(element.id, element as OSMNode);
    }
  }

  logger.info(`Building routes from ${ways.length} ways and ${nodeMap.size} nodes in ${region}`);

  // Build adjacency graph
  const graph = new Map<number, number[]>();
  for (const way of ways) {
    for (let i = 0; i < way.nodes.length - 1; i++) {
      const from = way.nodes[i];
      const to = way.nodes[i + 1];
      
      if (!graph.has(from)) graph.set(from, []);
      if (!graph.has(to)) graph.set(to, []);
      
      graph.get(from)!.push(to);
      graph.get(to)!.push(from); // bidirectional
    }
  }

  // Generate routes using DFS with backtracking
  let attempts = 0;
  const maxAttempts = targetCount * 10;
  let failReasons = {
    noLoop: 0,
    tooShort: 0,
    notValidLoop: 0,
    wrongDistance: 0
  };

  while (routes.length < targetCount && attempts < maxAttempts) {
    attempts++;
    
    // Pick random starting node with good connectivity
    const startNodes = Array.from(graph.keys()).filter(n => {
      const connections = graph.get(n)?.length || 0;
      return connections >= 2; // At least 2 connections for loop potential
    });

    if (startNodes.length === 0) {
      logger.warn(`No start nodes with sufficient connectivity found`);
      break;
    }
    
    const startNode = startNodes[Math.floor(Math.random() * startNodes.length)];
    const result = generateSingleLoop(startNode, graph, nodeMap, region);
    
    if (typeof result === 'string') {
      failReasons[result as keyof typeof failReasons]++;
    } else if (result) {
      routes.push(result);
      logger.info(`Generated route ${routes.length}/${targetCount} in ${region} (${attempts} attempts)`);
    }
  }

  logger.info(`Attempts: ${attempts}, Fail reasons:`, failReasons);
  logger.success(`Generated ${routes.length} routes for ${region}`);
  return routes;
}

/**
 * Find shortest path between two nodes using BFS
 */
function findShortestPath(
  start: number,
  end: number,
  graph: Map<number, number[]>,
  avoid: Set<number>,
  maxDepth: number
): number[] | null {
  const queue: [number, number[]][] = [[start, []]];
  const visited = new Set<number>(avoid);
  visited.add(start);
  
  while (queue.length > 0) {
    const [current, path] = queue.shift()!;
    
    if (path.length > maxDepth) continue;
    
    if (current === end) {
      return [...path, end];
    }
    
    const neighbors = graph.get(current) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, [...path, neighbor]]);
      }
    }
  }
  
  return null;
}

/**
 * Generate a single loop route using DFS
 */
function generateSingleLoop(
  startNode: number,
  graph: Map<number, number[]>,
  nodeMap: Map<number, OSMNode>,
  region: string
): GeneratedRoute | string | null {
  const path: number[] = [startNode];
  const visited = new Set<number>([startNode]);
  
  // Walk randomly for a while to build the "outbound" path
  let currentNode = startNode;
  const targetPathLength = 500 + Math.floor(Math.random() * 1500); // 500-2000 nodes
  
  for (let i = 0; i < targetPathLength; i++) {
    const neighbors = graph.get(currentNode) || [];
    const unvisited = neighbors.filter(n => !visited.has(n));
    
    if (unvisited.length === 0) {
      // No more unvisited neighbors, we'll return via visited path
      break;
    }
    
    // Pick a random unvisited neighbor
    const nextNode = unvisited[Math.floor(Math.random() * unvisited.length)];
    visited.add(nextNode);
    path.push(nextNode);
    currentNode = nextNode;
  }
  
  // Now create return path - try to find alternate route back or reverse the path
  const outboundLength = path.length;
  
  // Try to find an alternate path back to start
  const pathBack = findShortestPath(currentNode, startNode, graph, new Set(), 100);
  
  if (pathBack && pathBack.length > 1) {
    // Found alternate route back
    path.push(...pathBack.slice(1)); // Skip first node (duplicate of current)
  } else {
    // No alternate route, reverse back (still creates a valid route)
    const reversePath = [...path].reverse();
    path.push(...reversePath);
  }
  
  if (path.length < 15) return 'tooShort';
  
  // Convert path to RoutePoints
  const points: RoutePoint[] = path
    .map(nodeId => nodeMap.get(nodeId))
    .filter((n): n is OSMNode => n !== undefined)
    .map(n => ({ lat: n.lat, lon: n.lon }));
  
  // Remove validation that checks if it's a loop - we create round trips
  // if (!isValidLoop(points)) return 'notValidLoop';
  
  const distance_km = calculateDistance(points);
  
  // Filter by distance constraints
  if (distance_km < MIN_DISTANCE_KM || distance_km > MAX_DISTANCE_KM) {
    // Add logging to understand distance distribution
    if (Math.random() < 0.05) { // Log 5% of failures
      logger.warn(`Route rejected: distance ${distance_km.toFixed(2)}km (need ${MIN_DISTANCE_KM}-${MAX_DISTANCE_KM}km, ${points.length} points)`);
    }
    return 'wrongDistance';
  }
  
  const curviness = calculateCurviness(points);
  const elevation_gain_m = calculateElevationGain(points);
  
  // Determine category based on characteristics
  const category = determineCategory(curviness, elevation_gain_m, distance_km);
  const difficulty = determineDifficulty(curviness, elevation_gain_m, distance_km);
  
  return {
    points,
    distance_km,
    curviness,
    elevation_gain_m,
    region,
    category,
    difficulty,
  };
}

// ================================================================================
// ROUTE CLASSIFICATION
// ================================================================================

function determineCategory(
  curviness: number,
  elevationGain: number,
  distance: number
): Database['public']['Tables']['routes']['Row']['category'] {
  if (elevationGain > 1500) return 'mountain';
  if (distance > 200) return 'adventure';
  if (distance < 120) return 'weekend';
  if (curviness > 7) return 'scenic';
  return 'scenic';
}

function determineDifficulty(
  curviness: number,
  elevationGain: number,
  distance: number
): Database['public']['Tables']['routes']['Row']['difficulty'] {
  const score = (curviness / 10) * 0.3 + (elevationGain / 3000) * 0.4 + (distance / 300) * 0.3;
  
  if (score > 0.75) return 'expert';
  if (score > 0.5) return 'challenging';
  if (score > 0.25) return 'moderate';
  return 'easy';
}

// ================================================================================
// SCORING SYSTEM
// ================================================================================

function scoreRoute(route: GeneratedRoute): {
  scenic_score: number;
  road_quality_score: number;
  fun_factor_score: number;
} {
  // Scenic score: based on curviness and region
  const scenic_score = Math.min(10, route.curviness * 0.7 + 3);
  
  // Road quality: assume decent quality for secondary/tertiary roads
  const road_quality_score = 7 + Math.random() * 1.5; // 7.0 - 8.5
  
  // Fun factor: composite score
  const normalizedCurviness = route.curviness / 10;
  const normalizedElevation = Math.min(route.elevation_gain_m / 2000, 1);
  const normalizedRoadQuality = road_quality_score / 10;
  
  const fun_factor_score = 
    normalizedCurviness * 0.6 * 10 +
    normalizedElevation * 0.2 * 10 +
    normalizedRoadQuality * 0.2 * 10;
  
  return {
    scenic_score: Math.round(scenic_score * 10) / 10,
    road_quality_score: Math.round(road_quality_score * 10) / 10,
    fun_factor_score: Math.round(fun_factor_score * 10) / 10,
  };
}

// ================================================================================
// ROUTE METADATA GENERATION
// ================================================================================

const ROUTE_TITLE_TEMPLATES = [
  '{region} Scenic Loop',
  '{region} Mountain Ride',
  '{region} Twisties Tour',
  '{region} Backroads Adventure',
  '{region} Winding Roads',
  'Curves of {region}',
  '{region} Highland Circuit',
  '{region} Valley Run',
  'Through {region} Hills',
  '{region} Serpentine Route',
];

const ROUTE_DESCRIPTIONS = {
  easy: [
    'A relaxed ride through beautiful countryside with gentle curves and stunning views. Perfect for a leisurely day trip.',
    'Easy-going route ideal for beginners, featuring smooth roads and scenic landscapes.',
    'Comfortable cruise through picturesque terrain with minimal technical challenges.',
  ],
  moderate: [
    'Enjoyable mix of curves and straights through varied terrain. Great for intermediate riders seeking adventure.',
    'Balanced route combining scenic beauty with engaging riding, suitable for most riders.',
    'Pleasant journey through rolling hills with moderate technical sections.',
  ],
  challenging: [
    'Demanding route with tight switchbacks and elevation changes. Requires good bike control and experience.',
    'Technical ride featuring challenging curves and steep sections. Not for the faint of heart.',
    'Exciting route with demanding corners and significant elevation gain. Experience recommended.',
  ],
  expert: [
    'Extreme route for advanced riders only. Features relentless switchbacks, steep gradients, and technical sections.',
    'Master-level ride with unforgiving terrain and constant technical demands. Expert skills required.',
    'Ultimate challenge with extreme elevation changes and continuous tight curves. Only for highly skilled riders.',
  ],
};

function generateRouteTitle(route: GeneratedRoute): string {
  const template = ROUTE_TITLE_TEMPLATES[Math.floor(Math.random() * ROUTE_TITLE_TEMPLATES.length)];
  return template.replace('{region}', route.region);
}

function generateRouteDescription(route: GeneratedRoute): string {
  const descriptions = ROUTE_DESCRIPTIONS[route.difficulty];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// ================================================================================
// POI EXTRACTION
// ================================================================================

async function extractStops(route: GeneratedRoute, routeId: string): Promise<RouteStop[]> {
  const stops: RouteStop[] = [];
  
  // Sample points along the route for POI search
  const sampleIndices = [
    Math.floor(route.points.length * 0.25),
    Math.floor(route.points.length * 0.5),
    Math.floor(route.points.length * 0.75),
  ];
  
  for (let i = 0; i < sampleIndices.length; i++) {
    const point = route.points[sampleIndices[i]];
    const radius = 5000; // 5km radius
    
    // Overpass query for POIs
    const query = `
      [out:json][timeout:25];
      (
        node["tourism"="viewpoint"](around:${radius},${point.lat},${point.lon});
        node["amenity"="cafe"](around:${radius},${point.lat},${point.lon});
        node["amenity"="fuel"](around:${radius},${point.lat},${point.lon});
        node["tourism"="attraction"](around:${radius},${point.lat},${point.lon});
      );
      out body;
    `;
    
    try {
      const response = await axios.post<OSMData>(
        OVERPASS_API_URL,
        query,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 30000,
        }
      );
      
      for (const element of response.data.elements) {
        if ('lat' in element && 'lon' in element) {
          const node = element as OSMNode;
          const stopType = mapOSMTagsToStopType(node.tags || {});
          
          if (stopType) {
            stops.push({
              name: node.tags?.name || `${stopType} stop`,
              description: node.tags?.description || null,
              type: stopType,
              latitude: node.lat,
              longitude: node.lon,
              order_index: stops.length,
            });
          }
        }
      }
      
      // Avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      logger.warn(`Failed to fetch POIs for route ${routeId}:`, error);
    }
  }
  
  return stops.slice(0, 5); // Max 5 stops per route
}

function mapOSMTagsToStopType(tags: Record<string, string>): RouteStop['type'] | null {
  if (tags.tourism === 'viewpoint') return 'viewpoint';
  if (tags.amenity === 'cafe') return 'cafe';
  if (tags.amenity === 'fuel') return 'gas_station';
  if (tags.amenity === 'restaurant') return 'restaurant';
  if (tags.tourism === 'attraction') return 'landmark';
  if (tags.tourism === 'hotel' || tags.tourism === 'guest_house') return 'accommodation';
  return null;
}

// ================================================================================
// DATABASE OPERATIONS
// ================================================================================

async function saveRouteToDatabase(route: GeneratedRoute): Promise<string | null> {
  const title = generateRouteTitle(route);
  const description = generateRouteDescription(route);
  const scores = scoreRoute(route);
  
  // Convert points to GeoJSON LineString
  const polyline_coordinates = {
    type: 'LineString',
    coordinates: route.points.map(p => [p.lon, p.lat]),
  } as any;
  
  // Calculate estimated duration (average 50 km/h on scenic roads)
  const duration_minutes = Math.round((route.distance_km / 50) * 60);
  
  try {
    // Insert route
    const { data: routeData, error: routeError } = await supabase
      .from('routes')
      .insert({
        user_id: SYSTEM_USER_ID,
        title,
        description,
        difficulty: route.difficulty,
        distance_km: Math.round(route.distance_km * 100) / 100,
        duration_minutes,
        elevation_gain_m: route.elevation_gain_m,
        polyline_coordinates,
        region: route.region,
        category: route.category,
        scenic_score: scores.scenic_score,
        road_quality_score: scores.road_quality_score,
        fun_factor_score: scores.fun_factor_score,
        featured: scores.fun_factor_score > 8, // Feature high-scoring routes
        published: true,
      } as any)
      .select('id')
      .single();
    
    if (routeError) {
      logger.error('Failed to insert route:', routeError);
      return null;
    }
    
    const routeId = routeData.id;
    logger.success(`Saved route: ${title} (${routeId})`);
    
    // Insert stops
    const stops = await extractStops(route, routeId);
    
    if (stops.length > 0) {
      const { error: stopsError } = await supabase
        .from('route_stops')
        .insert(stops.map(stop => ({
          route_id: routeId,
          ...stop,
        })));
      
      if (stopsError) {
        logger.warn(`Failed to insert stops for route ${routeId}:`, stopsError);
      } else {
        logger.info(`Added ${stops.length} stops to route ${routeId}`);
      }
    }
    
    return routeId;
  } catch (error) {
    logger.error('Database operation failed:', error);
    return null;
  }
}

// ================================================================================
// MAIN EXECUTION
// ================================================================================

async function main() {
  logger.info('='.repeat(80));
  logger.info('Starting Motorcycle Routes Generator');
  logger.info('='.repeat(80));
  
  // Validate environment
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    logger.error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  const routesPerRegion = Math.ceil(TARGET_ROUTES_COUNT / REGIONS.length);
  const allRoutes: GeneratedRoute[] = [];
  
  // Generate routes for each region
  for (const region of REGIONS) {
    logger.info(`\nProcessing region: ${region.name}`);
    
    try {
      // Fetch road network
      const osmData = await fetchRoadNetwork(region.bbox);
      
      // Generate loop routes
      const routes = generateLoopRoutes(osmData, region.name, routesPerRegion);
      allRoutes.push(...routes);
      
      // Rate limiting between regions (5s to reduce server load)
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      logger.error(`Failed to process region ${region.name}:`, error);
    }
  }
  
  logger.info(`\n${'='.repeat(80)}`);
  logger.info(`Generated ${allRoutes.length} total routes`);
  logger.info('='.repeat(80));
  
  // Save routes to database with concurrency control
  logger.info('\nSaving routes to database...');
  
  const limit = pLimit(CONCURRENCY_LIMIT);
  let savedCount = 0;
  let failedCount = 0;
  
  const savePromises = allRoutes.map((route, index) =>
    limit(async () => {
      logger.info(`[${index + 1}/${allRoutes.length}] Saving route in ${route.region}...`);
      const routeId = await saveRouteToDatabase(route);
      
      if (routeId) {
        savedCount++;
      } else {
        failedCount++;
      }
    })
  );
  
  await Promise.all(savePromises);
  
  // Final summary
  logger.info(`\n${'='.repeat(80)}`);
  logger.success('Route Generation Complete!');
  logger.info(`Total routes generated: ${allRoutes.length}`);
  logger.info(`Successfully saved: ${savedCount}`);
  logger.info(`Failed: ${failedCount}`);
  logger.info('='.repeat(80));
}

// Run the script
main().catch(error => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
