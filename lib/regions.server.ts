/**
 * Loads the destination catalog from the `countries` and `regions` tables.
 * Cached for 5 minutes across requests (tag "regions") and once per request,
 * so a region a curator adds in the submit wizard gets its page without a
 * deploy.
 */

import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { supabase } from '@/lib/supabase/client'
import { buildCatalog, setRegions, getRegions, type CountryRow, type Region, type RegionRow } from './regions'
import { FALLBACK_REGIONS } from './regions-fallback'

async function fetchCatalog(): Promise<Region[]> {
  const [countries, regions] = await Promise.all([
    supabase.from('countries').select('code, flag, name, slug, intro, sort_order').eq('is_active', true),
    supabase.from('regions').select('country, route_region, aliases, name, slug, intro, sort_order').eq('is_active', true),
  ])
  // Before migration 027 (no slug column) or if the tables can't be read
  if (countries.error || regions.error || !countries.data?.length) return FALLBACK_REGIONS
  const catalog = buildCatalog(countries.data as unknown as CountryRow[], (regions.data ?? []) as unknown as RegionRow[])
  return catalog.length ? catalog : FALLBACK_REGIONS
}

const cachedCatalog = unstable_cache(fetchCatalog, ['region-catalog'], { revalidate: 300, tags: ['regions'] })

/** Load the catalog for this request; the sync helpers in lib/regions read it afterwards */
export const loadRegions = cache(async (): Promise<Region[]> => {
  try {
    const regions = await cachedCatalog()
    setRegions(regions)
  } catch {
    // keep whatever was loaded last (or the fallback)
  }
  return getRegions()
})
