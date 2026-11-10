/**
 * Saves a blog post from a JSON file into the database as a DRAFT, to be
 * reviewed and published in the admin (/<locale>/profile/admin/blog/<id>).
 *
 * File format:
 *   {
 *     "slug": "rotas-de-moto-nas-dolomitas",
 *     "cover_route_slug": "passo-giau-cortina-d-ampezzo-...",   // optional
 *     "translations": {
 *       "pt": { "title": "...", "description": "...", "body_md": "..." },
 *       "en": { ... }, "es": { ... }, "fr": { ... }              // fr/de optional
 *     }
 *   }
 *
 * A new slug creates a draft. An existing draft with the same slug is updated
 * (its translations are replaced). Published or deactivated posts are never
 * touched: edit those in the admin.
 *
 * Usage:
 *   npx tsx jobs/save_blog_post.ts <file.json>
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env.local') });

const LOCALES = ['pt', 'en', 'es', 'fr', 'de'];
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

interface Input {
  slug: string;
  cover_route_slug?: string | null;
  translations: Record<string, { title: string; description: string; body_md: string }>;
}

const file = process.argv[2];
if (!file) {
  console.error('Usage: npx tsx jobs/save_blog_post.ts <file.json>');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

async function main() {
  const input = JSON.parse(readFileSync(file, 'utf8')) as Input;

  if (!SLUG_RE.test(input.slug)) throw new Error(`Invalid slug: ${input.slug}`);
  const langs = Object.keys(input.translations ?? {});
  const unknown = langs.filter((l) => !LOCALES.includes(l));
  if (unknown.length) throw new Error(`Unknown languages: ${unknown.join(', ')}`);
  if (!input.translations.pt?.title || !input.translations.pt?.body_md) {
    throw new Error('Portuguese title and body are required');
  }

  let coverId: string | null = null;
  if (input.cover_route_slug) {
    const { data } = await supabase
      .from('routes')
      .select('id')
      .eq('slug', input.cover_route_slug)
      .eq('published', true)
      .maybeSingle();
    if (!data) throw new Error(`Cover route not found or not published: ${input.cover_route_slug}`);
    coverId = data.id;
  }

  const { data: existing } = await supabase
    .from('blog_posts')
    .select('id, status')
    .eq('slug', input.slug)
    .maybeSingle();
  if (existing && existing.status !== 'draft') {
    throw new Error(`"${input.slug}" is ${existing.status}; edit it in the admin instead`);
  }

  let postId = existing?.id as string | undefined;
  if (postId) {
    const { error } = await supabase.from('blog_posts').update({ cover_route_id: coverId }).eq('id', postId);
    if (error) throw error;
    await supabase.from('blog_post_translations').delete().eq('post_id', postId);
  } else {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({ slug: input.slug, status: 'draft', cover_route_id: coverId })
      .select('id')
      .single();
    if (error || !data) throw new Error(error?.message ?? 'insert failed');
    postId = data.id;
  }

  const { error: trError } = await supabase.from('blog_post_translations').insert(
    langs.map((locale) => ({
      post_id: postId,
      locale,
      title: input.translations[locale].title,
      description: input.translations[locale].description ?? '',
      body_md: input.translations[locale].body_md ?? '',
    })),
  );
  if (trError) throw trError;

  console.log(`${existing ? 'Updated' : 'Created'} draft "${input.slug}" (${langs.join(', ')})`);
  console.log(`Review and publish: ${SITE}/pt/profile/admin/blog/${postId}`);
}

main().catch((e) => {
  console.error(`✗ ${(e as Error).message}`);
  process.exit(1);
});
