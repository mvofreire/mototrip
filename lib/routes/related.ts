/**
 * What to show at the end of a route page: other routes worth riding and the
 * blog guides that feature this route. Read with the public client, so RLS
 * only returns published routes and posts.
 */

import { supabase } from '@/lib/supabase/client'
import { regionForRoute } from '@/lib/regions'
import { pickTranslation, type BlogTranslation } from '@/lib/blog/posts'

/** The few fields a related-route card needs (no stops, photos or geometry) */
export interface RelatedRoute {
  id: string
  slug: string | null
  title: string
  description: string | null
  region: string | null
  country: string | null
  category: string
  difficulty: string
  distance_km: number
  duration_minutes: number
  thumbnail_url: string | null
  curator_rating: number | null
  translations?: unknown
}

const RELATED_FIELDS =
  'id, slug, title, description, region, country, category, difficulty, distance_km, duration_minutes, thumbnail_url, curator_rating, translations'

type Current = Pick<RelatedRoute, 'id' | 'region' | 'country' | 'category' | 'difficulty' | 'distance_km'>

/** Higher is more related: same region page first, then type, length and rating */
function score(current: Current, candidate: RelatedRoute) {
  const region = regionForRoute(current)
  let s = 0
  if (region && regionForRoute(candidate)?.slug === region.slug) s += 4
  if (candidate.category === current.category) s += 2
  if (candidate.difficulty === current.difficulty) s += 0.5
  const a = Number(current.distance_km) || 1
  const b = Number(candidate.distance_km) || 1
  s -= Math.min(2, Math.abs(Math.log(b / a)))
  s += (Number(candidate.curator_rating) || 3) * 0.5
  return s
}

/**
 * Up to `limit` published routes related to this one: same country, ranked by
 * region, category, similar distance and the MotoTrip rating.
 */
export async function getRelatedRoutes(current: Current, limit = 3): Promise<RelatedRoute[]> {
  let query = supabase.from('routes').select(RELATED_FIELDS).eq('published', true).neq('id', current.id).limit(200)
  if (current.country) query = query.eq('country', current.country)
  const { data, error } = await query
  if (error) throw error
  return ((data ?? []) as unknown as RelatedRoute[])
    .map((r) => ({ r, s: score(current, r) }))
    .sort((x, y) => y.s - x.s)
    .slice(0, limit)
    .map(({ r }) => r)
}

export interface RoutePost {
  slug: string
  title: string
  description: string
}

type PostRow = { slug: string; translations: BlogTranslation[] }

/**
 * Published blog posts that feature this route: as a route card in the text
 * (`::route{slug="…"}`) or as the post's cover. Newest first.
 */
export async function getPostsForRoute(
  route: { id: string; slug: string | null },
  locale: string,
): Promise<RoutePost[]> {
  const fields = 'slug, published_at, translations:blog_post_translations(locale, title, description)'
  const queries = [
    supabase.from('blog_posts').select(fields).eq('status', 'published').eq('cover_route_id', route.id),
  ]
  // Slugs are [a-z0-9-], so they are safe inside the LIKE pattern
  if (route.slug && /^[a-z0-9-]+$/.test(route.slug)) {
    queries.push(
      supabase
        .from('blog_posts')
        .select(`${fields}, body:blog_post_translations!inner(locale)`)
        .eq('status', 'published')
        .ilike('body.body_md', `%::route{slug="${route.slug}"}%`),
    )
  }
  const results = await Promise.all(queries)
  const seen = new Map<string, { row: PostRow; date: string }>()
  for (const { data, error } of results) {
    if (error) throw error
    for (const row of (data ?? []) as unknown as (PostRow & { published_at: string | null })[]) {
      if (!seen.has(row.slug)) seen.set(row.slug, { row, date: row.published_at ?? '' })
    }
  }
  return Array.from(seen.values())
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(({ row }) => {
      const t = pickTranslation(row, locale)
      return t ? { slug: row.slug, title: t.title, description: t.description } : null
    })
    .filter((p): p is RoutePost => !!p)
}
