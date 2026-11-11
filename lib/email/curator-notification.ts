// Avisa a curadoria (curator@mototrip.pt) que há rotas novas para avaliar.
// Só roda no servidor / em jobs Node: precisa de RESEND_API_KEY.
import { getSiteUrl } from '../site-url'
import { routePath } from '../route-url'

const TO = process.env.CURATOR_NOTIFY_EMAIL || 'curator@mototrip.pt'
const FROM = process.env.CONTACT_FROM_EMAIL || 'MotoTrip <contact@mototrip.pt>'

export type NewRouteSummary = {
  id: string
  slug?: string | null
  title: string
  description?: string | null
  region?: string | null
  country?: string | null
  distance_km?: number | null
  duration_minutes?: number | null
  difficulty?: string | null
  category?: string | null
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function facts(r: NewRouteSummary) {
  const hours = r.duration_minutes ? `${Math.floor(r.duration_minutes / 60)}h${String(r.duration_minutes % 60).padStart(2, '0')}` : null
  return [
    [r.region, r.country].filter(Boolean).join(', '),
    r.distance_km != null ? `${Math.round(r.distance_km)} km` : null,
    hours,
    r.difficulty,
    r.category,
  ].filter(Boolean).join(' · ')
}

function excerpt(text: string | null | undefined, max = 280) {
  const t = (text || '').replace(/\s+/g, ' ').trim()
  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}

/** Sends one email listing the new routes. Never throws: returns false on failure. */
export async function notifyCuratorNewRoutes(routes: NewRouteSummary[]): Promise<boolean> {
  if (!routes.length) return true
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[curator-notify] RESEND_API_KEY is not set, skipping email')
    return false
  }

  const site = getSiteUrl()
  const adminUrl = `${site}/pt/profile/admin`
  const items = routes.map((r) => ({ r, url: `${site}${routePath('pt', r)}` }))
  const subject =
    routes.length === 1
      ? `[MotoTrip] Nova rota para avaliar: ${routes[0].title}`
      : `[MotoTrip] ${routes.length} novas rotas para avaliar`

  const text = [
    routes.length === 1 ? 'Há uma nova rota para avaliar:' : `Há ${routes.length} novas rotas para avaliar:`,
    '',
    ...items.flatMap(({ r, url }) => [`• ${r.title}`, `  ${facts(r)}`, excerpt(r.description) && `  ${excerpt(r.description)}`, `  Avaliar: ${url}`, ''].filter((l) => l !== '')),
    '',
    `Painel de curadoria: ${adminUrl}`,
  ].join('\n')

  const html = `
<p>${routes.length === 1 ? 'Há uma nova rota para avaliar:' : `Há ${routes.length} novas rotas para avaliar:`}</p>
${items
  .map(
    ({ r, url }) => `<div style="margin:0 0 18px;padding:12px 14px;border:1px solid #e5e5e5;border-radius:8px">
  <p style="margin:0 0 4px;font-size:16px"><strong>${escapeHtml(r.title)}</strong></p>
  <p style="margin:0 0 6px;color:#666;font-size:13px">${escapeHtml(facts(r))}</p>
  ${r.description ? `<p style="margin:0 0 8px;font-size:14px">${escapeHtml(excerpt(r.description))}</p>` : ''}
  <a href="${url}" style="display:inline-block;background:#ea580c;color:#fff;padding:8px 14px;border-radius:6px;text-decoration:none;font-size:14px">Avaliar rota</a>
</div>`,
  )
  .join('\n')}
<p style="font-size:13px"><a href="${adminUrl}">Abrir painel de curadoria</a></p>`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [TO], subject, text, html }),
    })
    if (!res.ok) {
      console.error('[curator-notify] Resend error', res.status, await res.text())
      return false
    }
    return true
  } catch (e) {
    console.error('[curator-notify] failed', e)
    return false
  }
}
