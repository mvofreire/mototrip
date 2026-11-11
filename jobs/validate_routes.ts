/**
 * Routes Validator and Enrichment
 * 
 * Loads all routes from the database and populates missing information:
 * - thumbnail_url
 * - route_type
 * - country
 * - description
 * - difficulty
 * - distance_km
 * - duration_minutes
 * - elevation_gain_m
 * 
 * Uses OpenStreetMap API to analyze routes and calculate values.
 * 
 * Usage: npx tsx jobs/validate_routes.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { Database } from '../types/database.types';
import { renderRouteThumbnail } from './lib/route_thumbnail';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000001';

// OpenStreetMap API Configuration
const OSM_API_BASE = 'https://nominatim.openstreetmap.org';
const OSM_OVERPASS_API = 'https://overpass-api.de/api/interpreter';
const USER_AGENT = 'MotoTrip Route Validator/1.0';

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
// TYPES AND INTERFACES
// ================================================================================

interface RouteData {
  id: string;
  title: string | null;
  description: string | null;
  difficulty: string | null;
  distance_km: number | null;
  duration_minutes: number | null;
  elevation_gain_m: number | null;
  polyline_coordinates: any;
  region: string | null;
  category: string | null;
  thumbnail_url: string | null;
  route_type: string | null;
  country: string | null;
}

interface RouteEnrichment {
  country?: string | null;
  route_type?: 'loop' | 'out_and_back' | null;
  description?: string | null;
  difficulty?: 'easy' | 'moderate' | 'challenging' | 'expert';
  distance_km?: number;
  duration_minutes?: number;
  elevation_gain_m?: number | null;
  thumbnail_url?: string | null;
}

// ================================================================================
// OPENSTREETMAP API FUNCTIONS
// ================================================================================

/**
 * Delay execution to respect rate limits
 */
async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get country from coordinates using Nominatim
 */
async function getCountryFromCoordinates(lat: number, lon: number): Promise<string | null> {
  try {
    await delay(1000); // Rate limiting
    
    const url = `${OSM_API_BASE}/reverse?format=json&lat=${lat}&lon=${lon}&zoom=3&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });
    
    if (!response.ok) {
      console.error(`Nominatim API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json() as any;
    return data.address?.country || null;
  } catch (error) {
    console.error('Error fetching country:', error);
    return null;
  }
}

/**
 * Calculate route statistics from polyline coordinates
 */
function calculateRouteStats(polyline: any): {
  distance_km: number;
  elevation_gain_m: number;
  duration_minutes: number;
} {
  if (!polyline || !polyline.coordinates || !Array.isArray(polyline.coordinates)) {
    return { distance_km: 0, elevation_gain_m: 0, duration_minutes: 0 };
  }

  const coordinates = polyline.coordinates;
  let totalDistance = 0;
  let totalElevationGain = 0;

  // Calculate distance and elevation
  for (let i = 1; i < coordinates.length; i++) {
    const [lon1, lat1, ele1 = 0] = coordinates[i - 1];
    const [lon2, lat2, ele2 = 0] = coordinates[i];

    // Haversine formula for distance
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    totalDistance += R * c;

    // Elevation gain (only count positive changes)
    const elevationChange = ele2 - ele1;
    if (elevationChange > 0) {
      totalElevationGain += elevationChange;
    }
  }

  // Estimate duration (average 40 km/h for motorcycles, adjusted for elevation)
  const baseMinutes = (totalDistance / 40) * 60;
  const elevationPenalty = (totalElevationGain / 100) * 2; // +2 minutes per 100m elevation gain
  const duration_minutes = Math.round(baseMinutes + elevationPenalty);

  return {
    distance_km: Math.round(totalDistance * 100) / 100,
    elevation_gain_m: Math.round(totalElevationGain),
    duration_minutes
  };
}

/**
 * Determine difficulty based on route characteristics
 */
function calculateDifficulty(distance: number, elevation: number, roadType: string): 'easy' | 'moderate' | 'challenging' | 'expert' {
  let score = 0;

  // Distance factor
  if (distance < 50) score += 0;
  else if (distance < 100) score += 1;
  else if (distance < 150) score += 2;
  else score += 3;

  // Elevation factor
  if (elevation < 300) score += 0;
  else if (elevation < 800) score += 1;
  else if (elevation < 1500) score += 2;
  else score += 3;

  // Road type factor
  if (roadType.includes('motorway')) score += 0;
  else if (roadType.includes('primary')) score += 1;
  else if (roadType.includes('secondary')) score += 2;
  else score += 3;

  if (score <= 2) return 'easy';
  if (score <= 4) return 'moderate';
  if (score <= 6) return 'challenging';
  return 'expert';
}

/**
 * Determine route type from coordinates and OSM data
 */
async function determineRouteType(coordinates: any[]): Promise<'loop' | 'out_and_back'> {
  if (!coordinates || coordinates.length === 0) return 'out_and_back';

  // Simple heuristic based on first and last points
  const [startLon, startLat] = coordinates[0];
  const [endLon, endLat] = coordinates[coordinates.length - 1];

  const distance = Math.sqrt(
    Math.pow(endLon - startLon, 2) + Math.pow(endLat - startLat, 2)
  );

  // If start and end are very close, it's likely a loop
  if (distance < 0.1) return 'loop';
  
  // Otherwise it's out and back or point-to-point (using out_and_back as default)
  return 'out_and_back';
}

/**
 * Generate description based on route characteristics
 */
function generateDescription(
  title: string | null,
  country: string | null,
  category: string | null,
  difficulty: string,
  distance: number,
  elevation: number,
  routeType: string
): string {
  const routeName = title || 'Esta rota';
  const countryText = country ? ` em ${country}` : '';
  const categoryDesc = {
    'scenic': 'paisagística',
    'mountain': 'montanhosa',
    'coastal': 'costeira',
    'weekend': 'de fim de semana',
    'adventure': 'de aventura'
  }[category || 'scenic'] || 'panorâmica';

  const difficultyDesc = {
    'easy': 'fácil',
    'moderate': 'moderada',
    'challenging': 'desafiadora',
    'expert': 'para experientes'
  }[difficulty];

  const routeTypeDesc = routeType === 'loop' ? 'circular' : 'ponto a ponto';

  return `${routeName} é uma rota ${categoryDesc}${countryText}, com ${distance.toFixed(0)}km de extensão ` +
    `e ${elevation}m de ganho de elevação. Classificada como ${difficultyDesc}, esta rota ${routeTypeDesc} ` +
    `oferece uma experiência única para motociclistas que buscam ${category === 'adventure' ? 'aventura' : 'belas paisagens'}.`;
}

/**
 * Render an OpenStreetMap thumbnail of the route, upload it and return its URL
 */
async function generateThumbnailUrl(routeId: string, coordinates: any[]): Promise<string | null> {
  if (!coordinates || coordinates.length < 2) return null;
  const png = await renderRouteThumbnail(coordinates);
  const path = `thumbnail-${routeId}.png`;
  const { error } = await supabase.storage
    .from('route_map')
    .upload(path, png, { contentType: 'image/png', upsert: true, cacheControl: '3600' });
  if (error) throw new Error(`thumbnail upload: ${error.message}`);
  return supabase.storage.from('route_map').getPublicUrl(path).data.publicUrl;
}

// ================================================================================
// ROUTE ENRICHMENT FUNCTIONS
// ================================================================================

/**
 * Check which fields need to be populated for a route
 */
function checkMissingFields(route: RouteData): string[] {
  const missing: string[] = [];

  if (!route.thumbnail_url) missing.push('thumbnail_url');
  if (!route.route_type) missing.push('route_type');
  if (!route.country) missing.push('country');
  if (!route.description) missing.push('description');
  if (!route.difficulty) missing.push('difficulty');
  if (!route.distance_km || route.distance_km === 0) missing.push('distance_km');
  if (!route.duration_minutes || route.duration_minutes === 0) missing.push('duration_minutes');
  if (!route.elevation_gain_m) missing.push('elevation_gain_m');

  return missing;
}

/**
 * Enrich a single route with missing data
 */
async function enrichRoute(route: RouteData): Promise<RouteEnrichment | null> {
  console.log(`\nProcessing route: ${route.title || route.id}`);
  
  const missing = checkMissingFields(route);
  if (missing.length === 0) {
    console.log('  ✓ Route already complete');
    return null;
  }

  console.log(`  Missing fields: ${missing.join(', ')}`);

  const enrichment: RouteEnrichment = {};

  try {
    // Parse coordinates
    const coordinates = route.polyline_coordinates?.coordinates || [];
    if (coordinates.length === 0) {
      console.log('  ✗ No coordinates available');
      return null;
    }

    // Calculate basic stats from polyline
    if (missing.includes('distance_km') || missing.includes('duration_minutes') || missing.includes('elevation_gain_m')) {
      const stats = calculateRouteStats(route.polyline_coordinates);
      if (missing.includes('distance_km')) enrichment.distance_km = stats.distance_km;
      if (missing.includes('duration_minutes')) enrichment.duration_minutes = stats.duration_minutes;
      if (missing.includes('elevation_gain_m')) enrichment.elevation_gain_m = stats.elevation_gain_m;
      console.log(`  ✓ Calculated: ${stats.distance_km}km, ${stats.elevation_gain_m}m elevation, ${stats.duration_minutes}min`);
    }

    // Get country from first coordinate
    if (missing.includes('country')) {
      const [lon, lat] = coordinates[0];
      const country = await getCountryFromCoordinates(lat, lon);
      if (country) {
        enrichment.country = country;
        console.log(`  ✓ Country: ${country}`);
      }
    }

    // Determine route type
    if (missing.includes('route_type')) {
      enrichment.route_type = await determineRouteType(coordinates);
      console.log(`  ✓ Route type: ${enrichment.route_type}`);
    }

    // Use calculated or existing values for further calculations
    const distance = enrichment.distance_km || route.distance_km || 100;
    const elevation = enrichment.elevation_gain_m || route.elevation_gain_m || 0;

    // Calculate difficulty
    if (missing.includes('difficulty')) {
      enrichment.difficulty = calculateDifficulty(distance, elevation, 'secondary');
      console.log(`  ✓ Difficulty: ${enrichment.difficulty}`);
    }

    const difficulty = enrichment.difficulty || route.difficulty || 'moderate';

    // Generate description
    if (missing.includes('description')) {
      enrichment.description = generateDescription(
        route.title,
        enrichment.country || route.country,
        route.category,
        enrichment.difficulty || difficulty,
        distance,
        elevation,
        enrichment.route_type || route.route_type || 'out_and_back'
      );
      console.log(`  ✓ Generated description`);
    }

    // Generate thumbnail
    if (missing.includes('thumbnail_url')) {
      enrichment.thumbnail_url = await generateThumbnailUrl(route.id, coordinates);
      console.log(`  ✓ Generated thumbnail`);
    }

    return enrichment;

  } catch (error) {
    console.error(`  ✗ Error enriching route:`, error);
    return null;
  }
}

/**
 * Update route in database with enriched data
 */
async function updateRoute(routeId: string, enrichment: RouteEnrichment): Promise<boolean> {
  try {
    const { error } = await (supabase as any)
      .from('routes')
      .update(enrichment)
      .eq('id', routeId);

    if (error) {
      console.error(`  ✗ Failed to update route: ${error.message}`);
      return false;
    }

    console.log(`  ✓ Route updated successfully`);
    return true;

  } catch (error) {
    console.error(`  ✗ Error updating route:`, error);
    return false;
  }
}

// ================================================================================
// MAIN PROCESSING
// ================================================================================

/**
 * Load all routes from database
 */
async function loadRoutes(): Promise<RouteData[]> {
  try {
    const { data: routes, error } = await supabase
      .from('routes')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load routes:', error.message);
      return [];
    }

    return (routes as any[]) || [];
  } catch (error) {
    console.error('Error loading routes:', error);
    return [];
  }
}

/**
 * Process all routes
 */
async function processRoutes() {
  console.log('='.repeat(80));
  console.log('ROUTE VALIDATION AND ENRICHMENT');
  console.log('='.repeat(80));

  // Load all routes
  console.log('\nLoading routes from database...');
  const routes = await loadRoutes();
  console.log(`Found ${routes.length} routes`);

  if (routes.length === 0) {
    console.log('\nNo routes to process. Generate some routes first!');
    return;
  }

  // Filter routes that need enrichment
  const routesNeedingEnrichment = routes.filter(route => {
    const missing = checkMissingFields(route);
    return missing.length > 0;
  });

  console.log(`\n${routesNeedingEnrichment.length} routes need enrichment`);
  console.log(`${routes.length - routesNeedingEnrichment.length} routes are already complete`);

  if (routesNeedingEnrichment.length === 0) {
    console.log('\n✓ All routes are already complete!');
    return;
  }

  // Process each route
  let processed = 0;
  let updated = 0;
  let failed = 0;

  for (const route of routesNeedingEnrichment) {
    processed++;
    console.log(`\n[${processed}/${routesNeedingEnrichment.length}] Processing: ${route.title || route.id}`);

    const enrichment = await enrichRoute(route);
    
    if (enrichment && Object.keys(enrichment).length > 0) {
      const success = await updateRoute(route.id, enrichment);
      if (success) {
        updated++;
      } else {
        failed++;
      }
    }

    // Rate limiting - wait between requests
    if (processed < routesNeedingEnrichment.length) {
      await delay(1500); // 1.5s between routes to respect OSM rate limits
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('PROCESSING SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total routes: ${routes.length}`);
  console.log(`Needed enrichment: ${routesNeedingEnrichment.length}`);
  console.log(`Successfully updated: ${updated}`);
  console.log(`Failed: ${failed}`);
  console.log(`Already complete: ${routes.length - routesNeedingEnrichment.length}`);
  console.log('='.repeat(80));
}

/**
 * Display statistics about current routes
 */
async function displayStatistics() {
  console.log('\n' + '='.repeat(80));
  console.log('CURRENT ROUTE STATISTICS');
  console.log('='.repeat(80));

  const routes = await loadRoutes();
  if (routes.length === 0) {
    console.log('\nNo routes found.');
    return;
  }

  // Count missing fields
  const fieldStats: Record<string, number> = {
    thumbnail_url: 0,
    route_type: 0,
    country: 0,
    description: 0,
    difficulty: 0,
    distance_km: 0,
    duration_minutes: 0,
    elevation_gain_m: 0,
  };

  routes.forEach(route => {
    const missing = checkMissingFields(route);
    missing.forEach(field => {
      if (field in fieldStats) fieldStats[field]++;
    });
  });

  console.log(`\nTotal routes: ${routes.length}`);
  console.log('\nMissing fields:');
  Object.entries(fieldStats).forEach(([field, count]) => {
    if (count > 0) {
      const percentage = ((count / routes.length) * 100).toFixed(1);
      console.log(`  ${field}: ${count} (${percentage}%)`);
    }
  });

  // Count complete routes
  const completeRoutes = routes.filter(route => checkMissingFields(route).length === 0);
  const completePercentage = ((completeRoutes.length / routes.length) * 100).toFixed(1);
  console.log(`\n✓ Complete routes: ${completeRoutes.length}/${routes.length} (${completePercentage}%)`);
}

// ================================================================================
// MAIN
// ================================================================================

async function main() {
  // Check environment
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables');
    console.error('   Please configure .env.local with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Show current statistics
  await displayStatistics();

  // Process routes
  await processRoutes();

  // Show updated statistics
  console.log('\n');
  await displayStatistics();

  console.log('\n✓ Processing complete!');
  console.log('\nNote: OpenStreetMap API has rate limits. Large batches may take time.');
  console.log('      The script automatically adds delays between requests.');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
