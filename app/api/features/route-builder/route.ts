import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/auth/api-user'
import { canUseRouteBuilder } from '@/lib/flags/route-builder'

export const dynamic = 'force-dynamic'

// Diz ao formulário de rota se este usuário pode desenhar a rota no mapa
// (flag "route-builder" do Vercel Flags). /api/routing aplica a mesma regra.
export async function GET(request: Request) {
  const user = await getApiUser(request)
  if (!user) return NextResponse.json({ enabled: false }, { status: 401 })
  return NextResponse.json(
    { enabled: await canUseRouteBuilder(user) },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
