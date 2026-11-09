/**
 * Import curated routes (jobs/data/curated_routes_<pt|es>.ts) into Supabase.
 *
 * For every route it:
 *  - computes the real road geometry, distance and duration with OSRM,
 *  - estimates elevation gain with the Open-Meteo elevation API,
 *  - renders a map thumbnail (OpenStreetMap tiles) and uploads it,
 *  - inserts the route and its stops (skipping titles that already exist).
 *
 * Usage:
 *   npx tsx jobs/import_curated_routes.ts --dry [--out=/tmp/thumbs] [--only=Arrábida]
 *   npx tsx jobs/import_curated_routes.ts
 *   npx tsx jobs/import_curated_routes.ts --dataset=es [--dry ...]   (Spain; default is pt)
 */

import { createClient } from '@supabase/supabase-js';
import * as turf from '@turf/turf';
import * as dotenv from 'dotenv';
import { renderRouteThumbnail } from './lib/route_thumbnail';
import { mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { CURATED_ROUTES_PT, type CuratedRoute } from './data/curated_routes_pt';
import { CURATED_ROUTES_ES } from './data/curated_routes_es';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env.local') });

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry');
const ONLY = args.find((a) => a.startsWith('--only='))?.slice(7);
const OUT_DIR = args.find((a) => a.startsWith('--out='))?.slice(6);
const DATASET = (args.find((a) => a.startsWith('--dataset='))?.slice(10) ?? 'pt').toLowerCase();

const DATASETS: Record<string, { country: string; routes: CuratedRoute[] }> = {
  pt: { country: 'PT', routes: CURATED_ROUTES_PT },
  es: { country: 'ES', routes: CURATED_ROUTES_ES },
};
if (!DATASETS[DATASET]) {
  console.error(`Unknown --dataset=${DATASET} (expected: ${Object.keys(DATASETS).join(', ')})`);
  process.exit(1);
}

// Admin/system profile that owns curated content
const SYSTEM_USER_ID = 'c8e0d98d-6270-45cd-be0b-2e9ca8c97135';
const COUNTRY = DATASETS[DATASET].country;
const THUMB_BUCKET = 'route_map';
const USER_AGENT = 'MotoTrip-route-import/1.0 (+https://mototrip.pt)';
// Motorcycle touring is slower than OSRM's car profile
const DURATION_FACTOR = 1.2;

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface RoutedResult {
  coordinates: Array<[number, number]>; // [lng, lat]
  distanceKm: number;
  durationMin: number;
  snaps: Array<{ name: string; distanceM: number }>;
}

async function fetchJson(url: string, retries = 5): Promise<any> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (res.ok) return res.json();
    if (attempt >= retries) {
      throw new Error(`${res.status} ${res.statusText} for ${url.slice(0, 120)}`);
    }
    // Rate limited: back off much longer
    await sleep(res.status === 429 ? 15000 * attempt : 1500 * attempt);
  }
}

async function routeWithOsrm(route: CuratedRoute): Promise<RoutedResult> {
  const coords = route.waypoints.map(([lat, lng]) => `${lng},${lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;
  const data = await fetchJson(url);
  if (data.code !== 'Ok') throw new Error(`OSRM: ${data.code} ${data.message ?? ''}`);
  const r = data.routes[0];

  // Keep the polyline light (~20 m tolerance) for the browser
  const line = turf.lineString(r.geometry.coordinates);
  const simplified = turf.simplify(line, { tolerance: 0.0002, highQuality: true });

  return {
    coordinates: simplified.geometry.coordinates.map(([lng, lat]) => [
      Number(lng.toFixed(6)),
      Number(lat.toFixed(6)),
    ]) as Array<[number, number]>,
    distanceKm: Math.round(r.distance / 100) / 10,
    durationMin: Math.round((r.duration / 60) * DURATION_FACTOR),
    snaps: data.waypoints.map((w: any) => ({ name: w.name, distanceM: Math.round(w.distance) })),
  };
}

async function elevationGain(coordinates: Array<[number, number]>): Promise<number | null> {
  try {
    const line = turf.lineString(coordinates);
    const lengthKm = turf.length(line);
    const samples = 100;
    const pts = Array.from({ length: samples }, (_, i) =>
      turf.along(line, (lengthKm * i) / (samples - 1)).geometry.coordinates,
    );
    const lat = pts.map((p) => p[1].toFixed(5)).join(',');
    const lng = pts.map((p) => p[0].toFixed(5)).join(',');
    const data = await fetchJson(
      `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`,
    );
    const elev: number[] = data.elevation;
    let gain = 0;
    for (let i = 1; i < elev.length; i++) {
      const d = elev[i] - elev[i - 1];
      if (d > 0) gain += d;
    }
    return Math.round(gain);
  } catch (e) {
    console.warn(`    elevation failed: ${(e as Error).message}`);
    return null;
  }
}

function slug(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 60);
}

async function importRoute(route: CuratedRoute) {
  console.log(`\n▶ ${route.title}`);

  if (!DRY_RUN) {
    const { data: existing } = await supabase
      .from('routes')
      .select('id')
      .eq('title', route.title)
      .maybeSingle();
    if (existing) {
      console.log('  already exists, skipping');
      return 'skipped';
    }
  }

  const routed = await routeWithOsrm(route);
  const straightKm = route.waypoints
    .slice(1)
    .reduce(
      (sum, wp, i) =>
        sum +
        turf.distance(
          [route.waypoints[i][1], route.waypoints[i][0]],
          [wp[1], wp[0]],
        ),
      0,
    );
  const detour = routed.distanceKm / Math.max(straightKm, 0.1);
  const gain = await elevationGain(routed.coordinates);

  console.log(
    `  ${routed.distanceKm} km · ${routed.durationMin} min · +${gain ?? '?'} m · ${routed.coordinates.length} pts · detour x${detour.toFixed(2)}`,
  );
  routed.snaps.forEach((s, i) =>
    console.log(`    wp${i}: ${s.name || '(unnamed)'} (${s.distanceM} m)${s.distanceM > 300 ? '  ⚠ far snap' : ''}`),
  );

  const thumb = await renderRouteThumbnail(routed.coordinates);
  if (OUT_DIR) {
    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(join(OUT_DIR, `${slug(route.title)}.png`), thumb);
  }

  if (DRY_RUN) return 'dry';

  const { data: inserted, error } = await supabase
    .from('routes')
    .insert({
      user_id: SYSTEM_USER_ID,
      title: route.title,
      description: route.description,
      difficulty: route.difficulty,
      category: route.category,
      route_type: route.route_type,
      region: route.region,
      country: COUNTRY,
      distance_km: routed.distanceKm,
      duration_minutes: routed.durationMin,
      elevation_gain_m: gain,
      polyline_coordinates: { type: 'LineString', coordinates: routed.coordinates },
      scenic_score: route.scenic_score,
      road_quality_score: route.road_quality_score,
      fun_factor_score: route.fun_factor_score,
      featured: route.featured ?? false,
      published: true,
    })
    .select('id')
    .single();
  if (error || !inserted) throw new Error(`insert route: ${error?.message}`);
  const routeId = inserted.id as string;

  if (route.stops.length) {
    const { error: stopsError } = await supabase.from('route_stops').insert(
      route.stops.map((s, i) => ({
        route_id: routeId,
        name: s.name,
        description: s.description,
        type: s.type,
        latitude: s.lat,
        longitude: s.lng,
        order_index: i,
      })),
    );
    if (stopsError) throw new Error(`insert stops: ${stopsError.message}`);
  }

  const path = `thumbnail-${routeId}.png`;
  const { error: uploadError } = await supabase.storage
    .from(THUMB_BUCKET)
    .upload(path, thumb, { contentType: 'image/png', upsert: true, cacheControl: '3600' });
  if (uploadError) {
    console.warn(`  thumbnail upload failed: ${uploadError.message}`);
  } else {
    const { data } = supabase.storage.from(THUMB_BUCKET).getPublicUrl(path);
    await supabase.from('routes').update({ thumbnail_url: data.publicUrl }).eq('id', routeId);
  }

  console.log(`  ✓ inserted ${routeId}`);
  return 'inserted';
}

async function main() {
  const routes = DATASETS[DATASET].routes.filter((r) => !ONLY || r.title.includes(ONLY));
  console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}${routes.length} curated routes (${COUNTRY})`);

  const results: Record<string, number> = {};
  for (const route of routes) {
    try {
      const status = await importRoute(route);
      results[status] = (results[status] ?? 0) + 1;
    } catch (e) {
      console.error(`  ✗ ${(e as Error).message}`);
      results.failed = (results.failed ?? 0) + 1;
    }
    await sleep(3000); // be polite to the public OSRM / Open-Meteo servers
  }
  console.log('\nDone:', results);
}

main();
