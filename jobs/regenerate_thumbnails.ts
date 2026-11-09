/**
 * Regenerates the stored map thumbnail of every route with OpenStreetMap
 * tiles (replacing old Google Static Maps images/URLs) and points
 * routes.thumbnail_url at the uploaded PNG.
 *
 * Usage:
 *   npx tsx jobs/regenerate_thumbnails.ts --dry [--out=/tmp/thumbs] [--only=<route id>]
 *   npx tsx jobs/regenerate_thumbnails.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { renderRouteThumbnail } from './lib/route_thumbnail';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env.local') });

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry');
const ONLY = args.find((a) => a.startsWith('--only='))?.slice(7);
const OUT_DIR = args.find((a) => a.startsWith('--out='))?.slice(6);
const BUCKET = 'route_map';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

async function main() {
  let query = supabase.from('routes').select('id, title, polyline_coordinates');
  if (ONLY) query = query.eq('id', ONLY);
  const { data: routes, error } = await query;
  if (error) throw error;
  if (OUT_DIR) mkdirSync(OUT_DIR, { recursive: true });

  let ok = 0;
  let failed = 0;
  for (const route of routes ?? []) {
    const coords = (route.polyline_coordinates as { coordinates?: [number, number][] } | null)
      ?.coordinates;
    if (!coords || coords.length < 2) {
      console.log(`- ${route.title}: no coordinates, skipped`);
      continue;
    }
    try {
      const png = await renderRouteThumbnail(coords);
      const path = `thumbnail-${route.id}.png`;
      if (OUT_DIR) writeFileSync(join(OUT_DIR, path), png);
      if (!DRY_RUN) {
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, png, { contentType: 'image/png', upsert: true, cacheControl: '3600' });
        if (uploadError) throw new Error(`upload: ${uploadError.message}`);
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        // Cache-bust so CDNs/social previews pick up the new image
        const url = `${data.publicUrl}?v=${Date.now()}`;
        const { error: updateError } = await supabase
          .from('routes')
          .update({ thumbnail_url: url })
          .eq('id', route.id);
        if (updateError) throw new Error(`update: ${updateError.message}`);
      }
      ok++;
      console.log(`✓ ${route.title}`);
    } catch (e) {
      failed++;
      console.warn(`✗ ${route.title}: ${(e as Error).message}`);
    }
  }
  console.log(`\nDone${DRY_RUN ? ' (dry run)' : ''}: ${ok} ok, ${failed} failed`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
