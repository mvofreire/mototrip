'use client'

import { setRegions, type Region } from '@/lib/regions'

/**
 * Hands the destination catalog loaded by the layout to client components
 * (route cards, filters, footer). Rendered before them, so it is set during
 * render rather than in an effect.
 */
export function RegionsHydrator({ regions }: { regions: Region[] }) {
  setRegions(regions)
  return null
}
