/**
 * Saves a blog post from a JSON file into the database as a DRAFT, to be
 * reviewed and published in the admin (/<locale>/profile/admin/blog/<id>).
 *
 * File format:
 *   {
 *     "slug": "rotas-de-moto-nas-dolomitas",
 *     "cover_route_slug": "passo-giau-cortina-d-ampezzo-...",   // optional, or:
 *     "cover_image": "./capa.jpg",          // optional local JPG/PNG/WebP (≤ 5 MB),
 *                                           // uploaded to the blog_images bucket
 *     "cover_image_credit": "Foto: Ana Silva / Unsplash",        // optional
 *     "translations": {
 *       "pt": { "title": "...", "description": "...", "body_md": "..." },
 *       "en": { ... }, "es": { ... }, "fr": { ... }              // fr/de optional
 *     }
 *   }
 *
 * The cover is a route map OR an image, not both. A relative cover_image
 * path is read from the JSON file's folder.
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
import { readFileSync, statSync } from 'fs';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, extname, join, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env.local') });

const LOCALES = ['pt', 'en', 'es', 'fr', 'de'];
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

interface Input {
  slug: string;
  cover_route_slug?: string | null;
  cover_image?: string | null;
  cover_image_credit?: string | null;
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

  if (input.cover_image && coverId) throw new Error('Use cover_route_slug or cover_image, not both');
  const coverImageUrl = input.cover_image ? await uploadCover(input.cover_image) : null;
  const cover = {
    cover_route_id: coverId,
    cover_image_url: coverImageUrl,
    cover_image_credit: coverImageUrl ? input.cover_image_credit?.trim() || null : null,
  };

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
    const { error } = await supabase.from('blog_posts').update(cover).eq('id', postId);
    if (error) throw error;
    await supabase.from('blog_post_translations').delete().eq('post_id', postId);
  } else {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({ slug: input.slug, status: 'draft', ...cover })
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

const IMAGE_TYPES: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

/** Uploads a local cover image to the public blog_images bucket and returns its URL */
async function uploadCover(path: string): Promise<string> {
  const full = resolve(dirname(resolve(file)), path);
  const type = IMAGE_TYPES[extname(full).toLowerCase()];
  if (!type) throw new Error(`cover_image must be JPG, PNG or WebP: ${path}`);
  if (statSync(full).size > 5 * 1024 * 1024) throw new Error(`cover_image is over 5 MB: ${path}`);
  const key = `${new Date().getFullYear()}/${randomUUID()}${extname(full).toLowerCase()}`;
  const { error } = await supabase.storage
    .from('blog_images')
    .upload(key, readFileSync(full), { contentType: type, cacheControl: '31536000' });
  if (error) throw new Error(`Cover upload failed: ${error.message}`);
  return supabase.storage.from('blog_images').getPublicUrl(key).data.publicUrl;
}

main().catch((e) => {
  console.error(`✗ ${(e as Error).message}`);
  process.exit(1);
});
