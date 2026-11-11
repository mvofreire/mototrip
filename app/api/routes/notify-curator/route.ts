import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isUuid } from '@/lib/route-url'
import { notifyCuratorNewRoutes } from '@/lib/email/curator-notification'

// Chamado pelo formulário de envio depois de criar uma rota. Os dados vêm do
// banco (não do corpo do pedido) e só rotas criadas há pouco geram email,
// para o endpoint não servir para mandar spam à curadoria.
const MAX_AGE_MS = 15 * 60 * 1000

export async function POST(request: Request) {
  let routeId: unknown
  try {
    routeId = (await request.json()).routeId
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }
  if (typeof routeId !== 'string' || !isUuid(routeId)) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  const supabase = createClient(url, key, { auth: { persistSession: false } })

  const { data: route, error } = await supabase
    .from('routes')
    .select('id, slug, title, description, region, country, distance_km, duration_minutes, difficulty, category, created_at')
    .eq('id', routeId)
    .maybeSingle()
  if (error || !route) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  if (Date.now() - new Date(route.created_at).getTime() > MAX_AGE_MS) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const sent = await notifyCuratorNewRoutes([route])
  return NextResponse.json({ ok: sent }, { status: sent ? 200 : 502 })
}
