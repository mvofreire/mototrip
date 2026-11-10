import { supabase } from '@/lib/supabase/client'
import type { BlogPostStatus } from '@/types/database.types'
import type { BlogLocale, BlogPost, BlogTranslation } from '@/lib/blog/posts'
import type { RouteWithDetails } from '@/types'

/**
 * Blog management for staff (admin and curator). RLS (migration 020) enforces
 * the same: only is_staff() can see drafts and write posts.
 */

export interface BlogPostDraft {
  slug: string
  status: BlogPostStatus
  cover_route_id: string | null
  /** ISO date, or null to set it on first publish */
  published_at: string | null
  translations: BlogTranslation[]
}

export interface RouteOption {
  id: string
  slug: string
  title: string
  region: string | null
  country: string | null
  thumbnail_url: string | null
}

const POST_FIELDS =
  'id, slug, status, cover_route_id, published_at, created_at, updated_at, cover:routes(slug, title, thumbnail_url)'

/** Ask the site to rebuild the blog pages now (needs the staff session token) */
async function revalidateSite() {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) return
  await fetch('/api/blog/revalidate', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
}

export class BlogAdminService {
  /** All posts, any status, newest edit first (no bodies) */
  static async listPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`${POST_FIELDS}, translations:blog_post_translations(locale, title, description)`)
      .order('updated_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as unknown as BlogPost[]
  }

  static async getPost(id: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`${POST_FIELDS}, translations:blog_post_translations(locale, title, description, body_md)`)
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return (data as unknown as BlogPost) ?? null
  }

  /** Creates (id = null) or updates a post with its translations; returns the id */
  static async savePost(id: string | null, draft: BlogPostDraft): Promise<string> {
    const fields = {
      slug: draft.slug,
      status: draft.status,
      cover_route_id: draft.cover_route_id,
      published_at: draft.published_at,
    }
    let postId = id
    if (postId) {
      const { error } = await supabase.from('blog_posts').update(fields as never).eq('id', postId)
      if (error) throw error
    } else {
      const { data, error } = await supabase.from('blog_posts').insert(fields as never).select('id').single()
      if (error || !data) throw error ?? new Error('insert failed')
      postId = (data as { id: string }).id
    }

    const keep = draft.translations.filter((t) => t.title.trim())
    if (keep.length) {
      const { error } = await supabase
        .from('blog_post_translations')
        .upsert(keep.map((t) => ({ ...t, post_id: postId! })) as never, { onConflict: 'post_id,locale' })
      if (error) throw error
    }
    // Languages removed in the editor (title cleared)
    const removed = draft.translations.filter((t) => !t.title.trim()).map((t) => t.locale)
    if (removed.length) {
      const { error } = await supabase
        .from('blog_post_translations')
        .delete()
        .eq('post_id', postId)
        .in('locale', removed)
      if (error) throw error
    }

    await revalidateSite()
    return postId
  }

  static async setStatus(id: string, status: BlogPostStatus) {
    const { error } = await supabase.from('blog_posts').update({ status } as never).eq('id', id)
    if (error) throw error
    await revalidateSite()
  }

  static async deletePost(id: string) {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id)
    if (error) throw error
    await revalidateSite()
  }

  static async isSlugTaken(slug: string, exceptId: string | null) {
    let query = supabase.from('blog_posts').select('id').eq('slug', slug)
    if (exceptId) query = query.neq('id', exceptId)
    const { data } = await query
    return (data ?? []).length > 0
  }

  /** Published routes matching a search (title, region or slug) */
  static async searchRoutes(term: string, limit = 20): Promise<RouteOption[]> {
    let query = supabase
      .from('routes')
      .select('id, slug, title, region, country, thumbnail_url')
      .eq('published', true)
      .order('title')
      .limit(limit)
    const q = term.trim().replace(/[%,()]/g, ' ')
    if (q) query = query.or(`title.ilike.%${q}%,region.ilike.%${q}%,slug.ilike.%${q}%`)
    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as RouteOption[]
  }

  /** Full routes for the preview cards; slugs that are missing or unpublished are left out */
  static async routesForPreview(slugs: string[]): Promise<RouteWithDetails[]> {
    if (!slugs.length) return []
    const { data, error } = await supabase
      .from('routes')
      .select('*, stops:route_stops(*), photos:route_photos(*), ratings:route_ratings(*)')
      .eq('published', true)
      .in('slug', slugs)
    if (error) throw error
    return (data ?? []) as RouteWithDetails[]
  }
}

export type { BlogLocale }
