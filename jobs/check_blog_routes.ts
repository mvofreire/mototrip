/**
 * Checks that every route a blog post links to (cover + ::route directives, in
 * every language) exists and is published. A missing slug renders no card.
 * Reads the posts from the database (any status).
 *
 * Usage:
 *   npx tsx jobs/check_blog_routes.ts [--post=<slug>]
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env.local') });

const ONLY = process.argv.find((a) => a.startsWith('--post='))?.slice(7);
// Same pattern as lib/blog/markdown.tsx
const ROUTE_DIRECTIVE = /::route\{[^}]*?slug=["']([^"']+)["'][^}]*\}/g;

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

async function main() {
  const { data: routes, error } = await supabase.from('routes').select('id, slug').eq('published', true);
  if (error) throw error;
  const published = new Set((routes ?? []).map((r) => r.slug as string));
  const publishedIds = new Set((routes ?? []).map((r) => r.id as string));

  let query = supabase
    .from('blog_posts')
    .select('slug, status, cover_route_id, translations:blog_post_translations(locale, body_md)')
    .order('slug');
  if (ONLY) query = query.eq('slug', ONLY);
  const { data: posts, error: postsError } = await query;
  if (postsError) throw postsError;
  if (!posts?.length) {
    console.error(ONLY ? `Post not found: ${ONLY}` : 'No posts');
    process.exit(1);
  }

  let problems = 0;
  for (const post of posts as any[]) {
    if (post.cover_route_id && !publishedIds.has(post.cover_route_id)) {
      problems++;
      console.log(`✗ ${post.slug}: cover route is not published`);
    }
    for (const tr of post.translations as { locale: string; body_md: string }[]) {
      const slugs = Array.from(tr.body_md.matchAll(ROUTE_DIRECTIVE), (m) => m[1]);
      const missing = slugs.filter((s) => !published.has(s));
      if (missing.length) problems++;
      console.log(
        `${missing.length ? '✗' : '✓'} ${post.slug} [${tr.locale}] (${post.status}) ${slugs.length} routes${missing.length ? ` — missing: ${missing.join(', ')}` : ''}`,
      );
    }
  }
  if (problems) process.exit(1);
}

main();
