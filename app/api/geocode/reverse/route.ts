import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/auth/api-user'
import { getSiteUrl } from '@/lib/site-url'

// Nomes de lugar para o título automático da rota (partida, chegada e a
// estrada principal). Usa o Nominatim do OpenStreetMap: no máximo 1 pedido
// por segundo e um User-Agent que identifique o site. O endpoint exige sessão
// e limita os pedidos por usuário; o wizard faz 3 pedidos por traçado.
const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse'
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 20

const hits = new Map<string, number[]>()
let lastCall = 0

function rateLimited(userId: string) {
  const now = Date.now()
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < WINDOW_MS)
  const limited = recent.length >= MAX_PER_WINDOW
  if (!limited) recent.push(now)
  hits.set(userId, recent)
  return limited
}

/** Spaces calls 1 s apart within this instance (Nominatim usage policy) */
async function throttle() {
  const wait = lastCall + 1000 - Date.now()
  lastCall = Math.max(Date.now(), lastCall + 1000)
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
}

type Address = Record<string, string | undefined>

export async function GET(request: Request) {
  const user = await getApiUser(request)
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (rateLimited(user.id)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  const params = new URL(request.url).searchParams
  const lat = Number(params.get('lat'))
  const lng = Number(params.get('lng'))
  // "place": town/village; "road": the way under the point (name or ref, e.g. N222)
  const kind = params.get('kind') === 'road' ? 'road' : 'place'
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const url = new URL(NOMINATIM)
  url.search = new URLSearchParams({
    format: 'jsonv2',
    lat: lat.toFixed(5),
    lon: lng.toFixed(5),
    zoom: kind === 'road' ? '17' : '14',
    addressdetails: '1',
    namedetails: '1',
  }).toString()

  try {
    await throttle()
    const res = await fetch(url, {
      headers: { 'User-Agent': `MotoTrip/1.0 (${getSiteUrl()})` },
      next: { revalidate: 60 * 60 * 24 * 30 },
    })
    if (!res.ok) return NextResponse.json({ error: 'unavailable' }, { status: 503 })
    const data = (await res.json()) as {
      address?: Address
      namedetails?: Address
      name?: string
    }
    const a = data.address ?? {}
    const place =
      a.village ?? a.town ?? a.city ?? a.municipality ?? a.hamlet ?? a.suburb ?? a.county ?? null
    const road = kind === 'road' ? (data.namedetails?.ref ?? a.road ?? data.name ?? null) : null
    return NextResponse.json({
      place,
      road,
      countryCode: a.country_code?.toUpperCase() ?? null,
    })
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}
