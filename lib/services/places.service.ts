import { supabase } from '@/lib/supabase/client'
import { COUNTRIES } from '@/lib/countries'
import { FALLBACK_REGIONS } from '@/lib/regions-fallback'
import type { Database } from '@/types/database.types'

export type Country = Database['public']['Tables']['countries']['Row']
export type Region = Database['public']['Tables']['regions']['Row']

/** Name in the page's language, falling back to Portuguese then English */
export function placeName(name: Record<string, string>, locale: string) {
  return name[locale] ?? name.pt ?? name.en ?? Object.values(name)[0] ?? ''
}

/** Before migration 025 runs: the lists that used to be hard-coded */
function fallback(): { countries: Country[]; regions: Region[] } {
  const now = new Date(0).toISOString()
  const countrySlug = (code: string) => FALLBACK_REGIONS.find((r) => r.kind === 'country' && r.country === code)?.slug ?? code.toLowerCase()
  return {
    countries: COUNTRIES.map((c, i) => ({
      code: c.code,
      flag: c.flag,
      name: c.name,
      slug: countrySlug(c.code),
      intro: null,
      sort_order: (i + 1) * 10,
      is_active: true,
      created_by: null,
      created_at: now,
    })),
    regions: FALLBACK_REGIONS.filter((r) => r.kind === 'region').map((r, i) => ({
      id: r.slug,
      country: r.country,
      route_region: r.match[0],
      name: r.name as Record<string, string>,
      slug: r.slug,
      intro: null,
      sort_order: (i + 1) * 10,
      aliases: r.match.slice(1),
      bbox: null,
      is_active: true,
      created_by: null,
      created_at: now,
    })),
  }
}

export const PlacesService = {
  async list(): Promise<{ countries: Country[]; regions: Region[] }> {
    const [countries, regions] = await Promise.all([
      supabase.from('countries').select('*').eq('is_active', true).order('code'),
      supabase.from('regions').select('*').eq('is_active', true),
    ])
    if (countries.error || regions.error || !countries.data?.length) return fallback()
    return {
      countries: countries.data as Country[],
      regions: (regions.data ?? []).map((r) => ({
        ...(r as Region),
        bbox: (r as Region).bbox?.map(Number) ?? null,
      })),
    }
  },

  /**
   * Curators and admins only (enforced by RLS). The database generates the
   * page slug from the name (unique across countries and regions, see
   * migration 027), so the new region gets /regions/<slug> right away.
   */
  async createRegion(input: { country: string; name: string; nameEn?: string }): Promise<Region> {
    const name = input.name.trim()
    const { data, error } = await supabase
      .from('regions')
      .insert({
        country: input.country,
        route_region: name,
        name: { pt: name, en: input.nameEn?.trim() || name },
      } as never)
      .select()
      .single()
    if (error) throw error
    return data as Region
  },
}
