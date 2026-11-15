import { supabase } from '@/lib/supabase/client'

export interface ReverseGeocode {
  place: string | null
  road: string | null
  countryCode: string | null
}

/** Town or road name at a point, through /api/geocode/reverse (null on failure) */
export async function reverseGeocode(
  point: { lat: number; lng: number },
  kind: 'place' | 'road' = 'place',
): Promise<ReverseGeocode | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return null
  try {
    const qs = new URLSearchParams({ lat: String(point.lat), lng: String(point.lng), kind })
    const res = await fetch(`/api/geocode/reverse?${qs}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    return res.ok ? ((await res.json()) as ReverseGeocode) : null
  } catch {
    return null
  }
}
