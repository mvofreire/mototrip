import { supabase } from '@/lib/supabase/client'
import type { RouteCuratorReview, RouteCuratorReviewUpdate } from '@/types'

/** The "Mototrip" curation profile that signs every MotoTrip review */
export const MOTOTRIP_CURATOR_ID = '4bd60894-3c72-484d-a2e9-2b5e22658853'

/** Fields staff can edit in the Admin */
export type CuratorReviewDraft = Pick<
  RouteCuratorReview,
  'overall' | 'scenic' | 'road' | 'fun' | 'confidence' | 'verdict' | 'highlights' | 'warnings' | 'best_season' | 'sources'
>

/** JSON with sorted object keys, so key order never counts as a change */
const stable = (v: unknown): string =>
  JSON.stringify(v ?? null, (_k, x) =>
    x && typeof x === 'object' && !Array.isArray(x)
      ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b)))
      : x,
  )
const same = (a: unknown, b: unknown) => {
  // Scores come back from Postgres as strings ("4.5")
  if (typeof a === 'string' && typeof b === 'number' && a.trim() !== '' && !isNaN(Number(a))) return Number(a) === b
  return stable(a) === stable(b)
}

const TEXT_FIELDS = ['verdict', 'highlights', 'warnings', 'best_season'] as const

/** True when saving `draft` over `current` changes the Portuguese text (translations get dropped) */
export function changesText(current: RouteCuratorReview | null | undefined, draft: CuratorReviewDraft) {
  if (!current) return false
  return TEXT_FIELDS.some((k) => !same(current[k], draft[k]))
}

/**
 * Writes for staff (RLS: is_staff()). Only changed fields are sent, so
 * editing a score keeps the translations; editing the Portuguese text drops
 * them (trigger in migration 021).
 */
export class CuratorReviewsService {
  static async save(routeId: string, current: RouteCuratorReview | null | undefined, draft: CuratorReviewDraft) {
    if (current) {
      const changes: RouteCuratorReviewUpdate = {}
      for (const [k, v] of Object.entries(draft) as [keyof CuratorReviewDraft, unknown][]) {
        if (!same(current[k], v)) (changes as any)[k] = v
      }
      if (Object.keys(changes).length === 0) return current
      const { data, error } = await (supabase as any)
        .from('route_curator_reviews')
        .update(changes)
        .eq('route_id', routeId)
        .select()
        .single()
      if (error) throw error
      return data as RouteCuratorReview
    }

    const { data, error } = await (supabase as any)
      .from('route_curator_reviews')
      .insert({ ...draft, route_id: routeId, curator_id: MOTOTRIP_CURATOR_ID, researched_at: new Date().toISOString() })
      .select()
      .single()
    if (error) throw error
    return data as RouteCuratorReview
  }

  static async remove(routeId: string) {
    const { error } = await (supabase as any).from('route_curator_reviews').delete().eq('route_id', routeId)
    if (error) throw error
  }
}
