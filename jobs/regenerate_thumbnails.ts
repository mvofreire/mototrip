/**
 * Regenerates the stored map thumbnail of every route with OpenStreetMap
 * tiles (replacing old Google Static Maps images/URLs) and points
 * routes.thumbnail_url at the uploaded PNG.
 *
 * Each route has two: thumbnail-<id>.png (light, also the social/OG image)
 * and thumbnail-<id>-dark.png (shown in the dark theme). The light one gets a
 * new ?v= on routes.thumbnail_url; the dark URL is derived from it
 * (lib/routes/thumbnail.ts), so it needs no column.
 *
 * Usage:
 *   npx tsx jobs/regenerate_thumbnails.ts --dry [--out=/tmp/thumbs] [--only=<route id>]
 *   npx tsx jobs/regenerate_thumbnails.ts [--theme=light|dark|both]   (default both)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { renderRouteThumbnail, thumbnailPath, type ThumbnailTheme } from './lib/route_thumbnail';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env.local') });

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry');
const ONLY = args.find((a) => a.startsWith('--only='))?.slice(7);
const OUT_DIR = args.find((a) => a.startsWith('--out='))?.slice(6);
const THEME = args.find((a) => a.startsWith('--theme='))?.slice(8) ?? 'both';
if (!['light', 'dark', 'both'].includes(THEME)) {
  console.error('--theme must be light, dark or both');
  process.exit(1);
}
const THEMES: ThumbnailTheme[] = THEME === 'both' ? ['light', 'dark'] : [THEME as ThumbnailTheme];
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
      for (const theme of THEMES) {
        const png = await renderRouteThumbnail(coords, { theme });
        const path = thumbnailPath(route.id, theme);
        if (OUT_DIR) writeFileSync(join(OUT_DIR, path), png);
        if (DRY_RUN) continue;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, png, { contentType: 'image/png', upsert: true, cacheControl: '31536000' });
        if (uploadError) throw new Error(`upload ${theme}: ${uploadError.message}`);
      }
      // A new light image gets a new ?v= (CDNs, social previews, next/image);
      // the dark-only run keeps the URL, its file name is new anyway
      if (!DRY_RUN && THEMES.includes('light')) {
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(thumbnailPath(route.id));
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
