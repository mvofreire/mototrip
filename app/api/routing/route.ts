import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Calcula o trecho de estrada entre dois pontos para o editor de rota no mapa
// (OpenRouteService). A chave fica só no servidor; o endpoint exige sessão e
// limita os pedidos por usuário para proteger a cota gratuita.
const ORS_URL = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson'
// Distância máxima (m) a que um ponto tocado é encaixado na estrada mais próxima
const SNAP_RADIUS_M = 1500
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 30

// Melhor esforço: em serverless cada instância tem o seu contador
const hits = new Map<string, number[]>()

function rateLimited(userId: string) {
  const now = Date.now()
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(userId, recent)
    return true
  }
  recent.push(now)
  hits.set(userId, recent)
  return false
}

const isPoint = (p: unknown): p is { lat: number; lng: number } => {
  if (!p || typeof p !== 'object') return false
  const { lat, lng } = p as Record<string, unknown>
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  )
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!supabaseUrl || !anonKey || !token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const supabase = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } })
  const { data: auth } = await supabase.auth.getUser(token)
  if (!auth?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: { from?: unknown; to?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }
  const { from, to } = body
  if (!isPoint(from) || !isPoint(to)) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const apiKey = process.env.OPENROUTESERVICE_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'unavailable' }, { status: 503 })

  if (rateLimited(auth.user.id)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  let res: Response
  try {
    res = await fetch(ORS_URL, {
      method: 'POST',
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coordinates: [
          [from.lng, from.lat],
          [to.lng, to.lat],
        ],
        elevation: true,
        instructions: false,
        radiuses: [SNAP_RADIUS_M, SNAP_RADIUS_M],
      }),
      signal: AbortSignal.timeout(15_000),
    })
  } catch (e) {
    console.warn('Routing request failed:', e)
    return NextResponse.json({ error: 'unavailable' }, { status: 502 })
  }

  if (res.status === 429) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  // 404/400: sem estrada perto de um dos pontos ou sem caminho entre eles
  if (res.status === 404 || res.status === 400) {
    return NextResponse.json({ error: 'no_route' }, { status: 404 })
  }
  if (!res.ok) {
    console.warn('Routing provider error:', res.status, await res.text().catch(() => ''))
    return NextResponse.json({ error: 'unavailable' }, { status: 502 })
  }

  const data = await res.json()
  const feature = data?.features?.[0]
  const coordinates = feature?.geometry?.coordinates as number[][] | undefined
  const summary = feature?.properties?.summary as { distance?: number; duration?: number } | undefined
  if (!coordinates || coordinates.length < 2) {
    return NextResponse.json({ error: 'no_route' }, { status: 404 })
  }

  return NextResponse.json({
    // [lng, lat, elevation?]
    coordinates,
    distanceKm: (summary?.distance ?? 0) / 1000,
    durationMin: (summary?.duration ?? 0) / 60,
  })
}
