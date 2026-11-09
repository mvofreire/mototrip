import { supabase } from '@/lib/supabase/client'

export interface RouteReview {
  id: string
  route_id: string
  user_id: string
  scenic_rating: number
  road_quality_rating: number
  fun_factor_rating: number
  comment: string | null
  created_at: string
  updated_at: string
  user_name: string | null
}

export interface ReviewInput {
  scenic: number
  road: number
  fun: number
  comment: string
}

/** "I rode this route" + 1–5 scores per category (route_ratings) */
export const RatingsService = {
  async list(routeId: string): Promise<RouteReview[]> {
    const { data, error } = await supabase
      .from('route_ratings')
      .select('id, route_id, user_id, scenic_rating, road_quality_rating, fun_factor_rating, comment, created_at, updated_at')
      .eq('route_id', routeId)
      .order('updated_at', { ascending: false })
    if (error) throw error
    const rows = (data ?? []) as Omit<RouteReview, 'user_name'>[]

    // Reviewer names (profiles are public: id, full_name)
    const ids = [...new Set(rows.map((r) => r.user_id))]
    const names = new Map<string, string | null>()
    if (ids.length) {
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', ids)
      for (const p of (profiles ?? []) as { id: string; full_name: string | null }[]) names.set(p.id, p.full_name)
    }
    return rows.map((r) => ({
      ...r,
      scenic_rating: Number(r.scenic_rating),
      road_quality_rating: Number(r.road_quality_rating),
      fun_factor_rating: Number(r.fun_factor_rating),
      user_name: names.get(r.user_id) ?? null,
    }))
  },

  async save(routeId: string, userId: string, input: ReviewInput) {
    const { error } = await supabase.from('route_ratings').upsert(
      {
        route_id: routeId,
        user_id: userId,
        scenic_rating: input.scenic,
        road_quality_rating: input.road,
        fun_factor_rating: input.fun,
        comment: input.comment.trim() || null,
      } as never,
      { onConflict: 'route_id,user_id' },
    )
    if (error) throw error
  },

  async remove(id: string) {
    const { error } = await supabase.from('route_ratings').delete().eq('id', id)
    if (error) throw error
  },
}

/** Average of the three categories for one review */
export const reviewScore = (r: Pick<RouteReview, 'scenic_rating' | 'road_quality_rating' | 'fun_factor_rating'>) =>
  (r.scenic_rating + r.road_quality_rating + r.fun_factor_rating) / 3
