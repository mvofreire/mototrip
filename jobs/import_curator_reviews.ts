/**
 * Import MotoTrip curator reviews (jobs/data/curator_reviews_<cc>.ts) into
 * public.route_curator_reviews, signed by the Mototrip profile.
 *
 * Reviews are matched to routes by slug. Routes that already have a review
 * are skipped (it may have been corrected in the Admin) unless --overwrite.
 * The review goes live right away: routes.curator_* is synced by a trigger.
 *
 * Usage:
 *   npx tsx jobs/import_curator_reviews.ts --dataset=pt --dry
 *   npx tsx jobs/import_curator_reviews.ts --dataset=pt [--only=<slug part>] [--overwrite]
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { validateCuratorReview, type CuratorReviewEntry } from './lib/curator_review';
import { CURATOR_REVIEWS_PT } from './data/curator_reviews_pt';
import { CURATOR_REVIEWS_ES } from './data/curator_reviews_es';
import { CURATOR_REVIEWS_FR } from './data/curator_reviews_fr';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env.local') });

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry');
const OVERWRITE = args.includes('--overwrite');
const ONLY = args.find((a) => a.startsWith('--only='))?.slice(7);
const DATASET = (args.find((a) => a.startsWith('--dataset='))?.slice(10) ?? 'pt').toLowerCase();

const DATASETS: Record<string, { country: string; reviews: CuratorReviewEntry[] }> = {
  pt: { country: 'PT', reviews: CURATOR_REVIEWS_PT },
  es: { country: 'ES', reviews: CURATOR_REVIEWS_ES },
  fr: { country: 'FR', reviews: CURATOR_REVIEWS_FR },
};
if (!DATASETS[DATASET]) {
  console.error(`Unknown --dataset=${DATASET} (expected: ${Object.keys(DATASETS).join(', ')})`);
  process.exit(1);
}

// The "Mototrip" curation profile that signs every review
const MOTOTRIP_CURATOR_ID = '4bd60894-3c72-484d-a2e9-2b5e22658853';
const COUNTRY = DATASETS[DATASET].country;

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

async function main() {
  const reviews = DATASETS[DATASET].reviews.filter((r) => !ONLY || r.slug.includes(ONLY));
  console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}${reviews.length} curator reviews (${COUNTRY})`);

  const dupes = reviews.map((r) => r.slug).filter((s, i, a) => a.indexOf(s) !== i);
  if (dupes.length) {
    console.error(`Duplicate slugs in dataset: ${[...new Set(dupes)].join(', ')}`);
    process.exit(1);
  }

  const { data: routes, error } = await supabase
    .from('routes')
    .select('id, slug, country, title, route_curator_reviews(route_id)')
    .in('slug', reviews.map((r) => r.slug));
  if (error) throw new Error(`load routes: ${error.message}`);
  const bySlug = new Map((routes ?? []).map((r: any) => [r.slug as string, r]));

  const results: Record<string, number> = {};
  const bump = (k: string) => (results[k] = (results[k] ?? 0) + 1);

  for (const review of reviews) {
    console.log(`\n${review.slug}  ${review.overall} (${review.scenic}/${review.road}/${review.fun}) · ${review.confidence} · ${review.sources.length} sources`);
    const problems = validateCuratorReview(review);
    const route: any = bySlug.get(review.slug);
    if (!route) problems.push('no route with this slug');
    else if (route.country !== COUNTRY) problems.push(`route is in ${route.country}, dataset is ${COUNTRY}`);
    if (problems.length) {
      problems.forEach((p) => console.error(`  ✗ ${p}`));
      bump('invalid');
      continue;
    }

    const exists = Array.isArray(route.route_curator_reviews)
      ? route.route_curator_reviews.length > 0
      : !!route.route_curator_reviews;
    if (exists && !OVERWRITE) {
      console.log('  · already reviewed (use --overwrite to replace)');
      bump('skipped');
      continue;
    }
    if (DRY_RUN) {
      console.log(`  ✓ valid${exists ? ' (would overwrite)' : ''}`);
      bump('valid');
      continue;
    }

    const { i18n, slug: _slug, ...pt } = review;
    const { error: upsertError } = await supabase.from('route_curator_reviews').upsert(
      {
        route_id: route.id,
        curator_id: MOTOTRIP_CURATOR_ID,
        overall: pt.overall,
        scenic: pt.scenic,
        road: pt.road,
        fun: pt.fun,
        verdict: pt.verdict,
        highlights: pt.highlights,
        warnings: pt.warnings,
        best_season: pt.best_season ?? null,
        translations: i18n,
        sources: pt.sources,
        confidence: pt.confidence,
        researched_at: pt.researched_at,
      },
      { onConflict: 'route_id' },
    );
    if (upsertError) {
      console.error(`  ✗ ${upsertError.message}`);
      bump('failed');
      continue;
    }
    console.log(`  ✓ ${exists ? 'overwritten' : 'inserted'}`);
    bump(exists ? 'overwritten' : 'inserted');
  }

  console.log(`\nDone: ${JSON.stringify(results)}`);
  if (results.invalid || results.failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
