/**
 * Routes Generator Validation and Testing
 * 
 * Helper script to validate generated routes and test the generator
 * 
 * Usage: npx tsx jobs/validate_routes.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { Database } from '../types/database.types';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000001';

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
// VALIDATION FUNCTIONS
// ================================================================================

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

async function validateSystemUser(): Promise<ValidationResult> {
  const result: ValidationResult = { passed: true, errors: [], warnings: [] };

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', SYSTEM_USER_ID)
      .single();

    if (error || !data) {
      result.passed = false;
      result.errors.push('System user not found. Run migration 003_routes_generator_setup.sql first.');
    } else {
      console.log('✓ System user exists:', (data as any).name);
    }
  } catch (error) {
    result.passed = false;
    result.errors.push(`Failed to check system user: ${error}`);
  }

  return result;
}

async function validateRoutes(): Promise<ValidationResult> {
  const result: ValidationResult = { passed: true, errors: [], warnings: [] };

  try {
    const { data: routes, error } = await supabase
      .from('routes')
      .select('*')
      .eq('user_id', SYSTEM_USER_ID);

    if (error) {
      result.passed = false;
      result.errors.push(`Failed to fetch routes: ${error.message}`);
      return result;
    }

    if (!routes || routes.length === 0) {
      result.warnings.push('No routes found. Run the generator first.');
      return result;
    }

    console.log(`\n✓ Found ${routes.length} generated routes`);

    // Type assertion to work around Supabase typing issues
    const typedRoutes = routes as any[];

    // Validate each route
    for (const route of typedRoutes) {
      // Check required fields
      if (!route.title) {
        result.errors.push(`Route ${route.id}: Missing title`);
      }

      if (!route.polyline_coordinates) {
        result.errors.push(`Route ${route.id}: Missing polyline_coordinates`);
      }

      // Validate distance
      if (route.distance_km < 80 || route.distance_km > 250) {
        result.warnings.push(
          `Route ${route.id}: Distance ${route.distance_km}km outside expected range (80-250km)`
        );
      }

      // Validate scores
      if (route.scenic_score < 0 || route.scenic_score > 10) {
        result.errors.push(
          `Route ${route.id}: Invalid scenic_score ${route.scenic_score}`
        );
      }

      if (route.road_quality_score < 0 || route.road_quality_score > 10) {
        result.errors.push(
          `Route ${route.id}: Invalid road_quality_score ${route.road_quality_score}`
        );
      }

      if (route.fun_factor_score < 0 || route.fun_factor_score > 10) {
        result.errors.push(
          `Route ${route.id}: Invalid fun_factor_score ${route.fun_factor_score}`
        );
      }

      // Validate GeoJSON structure
      if (route.polyline_coordinates) {
        const geojson = route.polyline_coordinates as any;
        if (geojson.type !== 'LineString') {
          result.errors.push(
            `Route ${route.id}: Invalid GeoJSON type ${geojson.type}`
          );
        }

        if (!Array.isArray(geojson.coordinates) || geojson.coordinates.length < 10) {
          result.errors.push(
            `Route ${route.id}: Insufficient coordinates (${geojson.coordinates?.length || 0})`
          );
        }
      }
    }

    if (result.errors.length === 0) {
      console.log('✓ All routes passed validation');
    }
  } catch (error) {
    result.passed = false;
    result.errors.push(`Validation failed: ${error}`);
  }

  return result;
}

async function validateRouteStops(): Promise<ValidationResult> {
  const result: ValidationResult = { passed: true, errors: [], warnings: [] };

  try {
    const { data: routes } = await supabase
      .from('routes')
      .select('id')
      .eq('user_id', SYSTEM_USER_ID);

    if (!routes || routes.length === 0) {
      result.warnings.push('No routes to check stops for');
      return result;
    }

    const routeIds = typedRoutes.map(r => r.id);

    const { data: stops, error } = await supabase
      .from('route_stops')
      .select('*')
      .in('route_id', routeIds);

    if (error) {
      result.passed = false;
      result.errors.push(`Failed to fetch route stops: ${error.message}`);
      return result;
    }

    if (!stops || stops.length === 0) {
      result.warnings.push('No route stops found');
      return result;
    }

    console.log(`\n✓ Found ${stops.length} route stops`);

    // Type assertion to work around Supabase typing issues
    const typedStops = stops as any[];

    // Validate each stop
    for (const stop of typedStops) {
      // Check coordinates
      if (stop.latitude < -90 || stop.latitude > 90) {
        result.errors.push(
          `Stop ${stop.id}: Invalid latitude ${stop.latitude}`
        );
      }

      if (stop.longitude < -180 || stop.longitude > 180) {
        result.errors.push(
          `Stop ${stop.id}: Invalid longitude ${stop.longitude}`
        );
      }

      // Check type
      const validTypes = ['viewpoint', 'cafe', 'gas_station', 'restaurant', 'landmark', 'accommodation'];
      if (!validTypes.includes(stop.type)) {
        result.errors.push(
          `Stop ${stop.id}: Invalid type ${stop.type}`
        );
      }
    }

    if (result.errors.length === 0) {
      console.log('✓ All route stops passed validation');
    }
  } catch (error) {
    result.passed = false;
    result.errors.push(`Stop validation failed: ${error}`);
  }

  return result;
}

async function generateStatistics() {
  console.log('\n' + '='.repeat(80));
  console.log('ROUTE STATISTICS');
  console.log('='.repeat(80));

  try {
    const { data: routes } = await supabase
      .from('routes')
      .select('*')
      .eq('user_id', SYSTEM_USER_ID);

    if (!routes || routes.length === 0) {
      console.log('No routes found.');
      return;
    }

    // Type assertion to work around Supabase typing issues
    const typedRoutes = routes as any[];

    // Overall stats
    const totalRoutes = typedRoutes.length;
    const totalDistance = typedRoutes.reduce((sum, r) => sum + Number(r.distance_km), 0);
    const avgDistance = totalDistance / totalRoutes;
    const avgScenicScore = typedRoutes.reduce((sum, r) => sum + Number(r.scenic_score), 0) / totalRoutes;
    const avgFunFactor = typedRoutes.reduce((sum, r) => sum + Number(r.fun_factor_score), 0) / totalRoutes;
    const featuredCount = typedRoutes.filter(r => r.featured).length;

    console.log(`\nOverall Statistics:`);
    console.log(`  Total Routes: ${totalRoutes}`);
    console.log(`  Total Distance: ${totalDistance.toFixed(2)} km`);
    console.log(`  Average Distance: ${avgDistance.toFixed(2)} km`);
    console.log(`  Average Scenic Score: ${avgScenicScore.toFixed(2)} / 10`);
    console.log(`  Average Fun Factor: ${avgFunFactor.toFixed(2)} / 10`);
    console.log(`  Featured Routes: ${featuredCount} (${((featuredCount/totalRoutes)*100).toFixed(1)}%)`);

    // By region
    const byRegion = typedRoutes.reduce((acc, r) => {
      const region = r.region || 'Unknown';
      if (!acc[region]) acc[region] = [];
      acc[region].push(r);
      return acc;
    }, {} as Record<string, typeof routes>);

    console.log(`\nBy Region:`);
    for (const [region, regionRoutes] of Object.entries(byRegion)) {
      console.log(`  ${region}: ${regionRoutes.length} routes`);
    }

    // By difficulty
    const byDifficulty = typedRoutes.reduce((acc, r) => {
      if (!acc[r.difficulty]) acc[r.difficulty] = 0;
      acc[r.difficulty]++;
      return acc;
    }, {} as Record<string, number>);

    console.log(`\nBy Difficulty:`);
    for (const [difficulty, count] of Object.entries(byDifficulty)) {
      console.log(`  ${difficulty}: ${count} routes`);
    }

    // By category
    const byCategory = typedRoutes.reduce((acc, r) => {
      if (!acc[r.category]) acc[r.category] = 0;
      acc[r.category]++;
      return acc;
    }, {} as Record<string, number>);

    console.log(`\nBy Category:`);
    for (const [category, count] of Object.entries(byCategory)) {
      console.log(`  ${category}: ${count} routes`);
    }

    // Top routes
    const topRoutes = typedRoutes
      .sort((a, b) => Number(b.fun_factor_score) - Number(a.fun_factor_score))
      .slice(0, 5);

    console.log(`\nTop 5 Routes by Fun Factor:`);
    topRoutes.forEach((route, index) => {
      console.log(`  ${index + 1}. ${route.title} (${route.fun_factor_score}/10)`);
    });

  } catch (error) {
    console.error('Failed to generate statistics:', error);
  }
}

// ================================================================================
// MAIN
// ================================================================================

async function main() {
  console.log('='.repeat(80));
  console.log('ROUTES GENERATOR VALIDATION');
  console.log('='.repeat(80));

  // Check environment
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables');
    console.error('   Please configure .env.local with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log('\n1. Validating System User...');
  const userResult = await validateSystemUser();
  
  console.log('\n2. Validating Routes...');
  const routesResult = await validateRoutes();
  
  console.log('\n3. Validating Route Stops...');
  const stopsResult = await validateRouteStops();

  // Generate statistics
  await generateStatistics();

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(80));

  const allResults = [userResult, routesResult, stopsResult];
  const totalErrors = allResults.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = allResults.reduce((sum, r) => sum + r.warnings.length, 0);

  if (totalErrors > 0) {
    console.log('\n❌ VALIDATION FAILED\n');
    console.log('Errors:');
    allResults.forEach(r => {
      r.errors.forEach(err => console.log(`  - ${err}`));
    });
  } else {
    console.log('\n✓ ALL VALIDATIONS PASSED\n');
  }

  if (totalWarnings > 0) {
    console.log('Warnings:');
    allResults.forEach(r => {
      r.warnings.forEach(warn => console.log(`  - ${warn}`));
    });
  }

  console.log('\n' + '='.repeat(80));

  process.exit(totalErrors > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
