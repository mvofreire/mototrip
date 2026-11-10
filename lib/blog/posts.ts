/**
 * Blog posts live in the database (blog_posts + blog_post_translations,
 * migration 020) and are edited in the admin. The body of each language is
 * Markdown with route cards (see lib/blog/markdown.tsx).
 *
 * These helpers read published posts with the public client, so RLS only
 * returns what anyone may see.
 */

import { supabase } from '@/lib/supabase/client'
import { RoutesService } from '@/lib/services/routes.service'
import type { BlogPostStatus } from '@/types/database.types'
import type { RouteWithDetails } from '@/types'

export const BLOG_LOCALES = ['pt', 'en', 'es', 'fr', 'de'] as const
export type BlogLocale = (typeof BLOG_LOCALES)[number]

export interface BlogTranslation {
  locale: BlogLocale
  title: string
  description: string
  body_md: string
}

export interface BlogPost {
  id: string
  slug: string
  status: BlogPostStatus
  cover_route_id: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  cover: { slug: string; title: string; thumbnail_url: string | null } | null
  translations: BlogTranslation[]
}

const POST_FIELDS = 'id, slug, status, cover_route_id, published_at, created_at, updated_at, cover:routes(slug, title, thumbnail_url)'

/**
 * Translation shown for a page locale: that language, else English, else
 * Portuguese (the usual original), else whatever exists.
 */
export function pickTranslation(post: Pick<BlogPost, 'translations'>, locale: string): BlogTranslation | undefined {
  const by = (l: string) => post.translations.find((t) => t.locale === l)
  return by(locale) ?? by('en') ?? by('pt') ?? post.translations[0]
}

/** Published posts, newest first (title and description only, no body) */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`${POST_FIELDS}, translations:blog_post_translations(locale, title, description)`)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as BlogPost[]
}

/** A published post with every translation, or null */
export async function getPublishedPost(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`${POST_FIELDS}, translations:blog_post_translations(locale, title, description, body_md)`)
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return (data as unknown as BlogPost) ?? null
}

/** Published routes with these slugs, keyed by slug (for the route cards) */
export async function routesBySlug(slugs: string[]): Promise<Map<string, RouteWithDetails>> {
  if (!slugs.length) return new Map()
  const routes = ((await RoutesService.getRoutesBySlugs(slugs).catch(() => [])) as RouteWithDetails[]) ?? []
  return new Map(routes.map((r) => [r.slug, r]))
}
