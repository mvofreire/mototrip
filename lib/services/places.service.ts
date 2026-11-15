import { supabase } from '@/lib/supabase/client'
import { COUNTRIES } from '@/lib/countries'
import { REGIONS } from '@/lib/regions'
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
  return {
    countries: COUNTRIES.map((c) => ({
      code: c.code,
      flag: c.flag,
      name: c.name,
      is_active: true,
      created_by: null,
      created_at: now,
    })),
    regions: REGIONS.filter((r) => r.kind === 'region').map((r) => ({
      id: r.slug,
      country: r.country,
      route_region: r.match[0],
      name: r.name,
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

  /** Curators and admins only (enforced by RLS) */
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
