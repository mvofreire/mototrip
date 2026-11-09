import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import { formatDuration } from '@/lib/utils'
import { regionForRoute, textFor } from '@/lib/regions'
import { getSiteUrl } from '@/lib/site-url'
import { localizeRoute } from '@/lib/localize'
import pt from '@/locales/pt.json'
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import fr from '@/locales/fr.json'
import de from '@/locales/de.json'

/**
 * Vertical (1080×1920) image of a route for Instagram stories:
 * the route line on a dark background, its name, numbers and @mototrip.pt.
 * GET /api/story/<slug>?locale=pt
 */
export const runtime = 'edge'

const W = 1080
const H = 1920
const RED = '#ef233c'
const BG = '#0d0f14'
const MAP = { x: 90, y: 560, w: 900, h: 860 }
const STRINGS = { pt, en, es, fr, de } as const

type Coord = [number, number] // [lng, lat]

/** Fit the route into the map box (equirectangular, aspect-correct) */
function project(coords: Coord[]) {
  const midLat = coords.reduce((s, c) => s + c[1], 0) / coords.length
  const k = Math.cos((midLat * Math.PI) / 180)
  const xs = coords.map((c) => c[0] * k)
  const ys = coords.map((c) => -c[1])
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const scale = Math.min(MAP.w / (maxX - minX || 1e-6), MAP.h / (maxY - minY || 1e-6)) * 0.92
  const offX = MAP.x + (MAP.w - (maxX - minX) * scale) / 2
  const offY = MAP.y + (MAP.h - (maxY - minY) * scale) / 2
  return (c: Coord) => [offX + (c[0] * k - minX) * scale, offY + (-c[1] - minY) * scale] as const
}

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const url = new URL(req.url)
  const localeParam = url.searchParams.get('locale') ?? 'pt'
  const locale = (localeParam in STRINGS ? localeParam : 'pt') as keyof typeof STRINGS
  const t = STRINGS[locale].story

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  })
  // Only public routes (RLS hides the rest from the anon key)
  const { data: route } = await supabase
    .from('routes')
    .select('title, description, translations, slug, distance_km, duration_minutes, elevation_gain_m, region, country, polyline_coordinates, route_stops(latitude, longitude, order_index)')
    .eq('slug', params.slug)
    .eq('published', true)
    .maybeSingle()

  if (!route) return new Response('Not found', { status: 404 })

  const [extraBold, semiBold] = await Promise.all([
    fetch(new URL('../../../../assets/fonts/BarlowCondensed-ExtraBold.ttf', import.meta.url)).then((r) => r.arrayBuffer()),
    fetch(new URL('../../../../assets/fonts/BarlowCondensed-SemiBold.ttf', import.meta.url)).then((r) => r.arrayBuffer()),
  ])

  const coords = ((route.polyline_coordinates as { coordinates?: Coord[] } | null)?.coordinates ?? []).filter(
    (c) => Array.isArray(c) && c.length >= 2,
  )
  // Keep the SVG small: at most ~600 points
  const step = Math.max(1, Math.ceil(coords.length / 600))
  const line = coords.filter((_, i) => i % step === 0 || i === coords.length - 1)
  const toXY = line.length > 1 ? project(line) : null
  const d = toXY ? line.map((c, i) => `${i ? 'L' : 'M'}${toXY(c)[0].toFixed(1)} ${toXY(c)[1].toFixed(1)}`).join(' ') : ''
  const start = toXY ? toXY(line[0]) : null
  const end = toXY ? toXY(line[line.length - 1]) : null
  const stops = toXY
    ? ((route.route_stops ?? []) as { latitude: number; longitude: number; order_index: number }[])
        .sort((a, b) => a.order_index - b.order_index)
        .map((s) => toXY([Number(s.longitude), Number(s.latitude)]))
    : []

  // "Nacional 2 | Chaves > Faro" → big name + smaller "Chaves > Faro"
  const title = localizeRoute({ ...route, stops: null }, locale).title
  const [name, ...rest] = title.split('|').map((s: string) => s.trim())
  const subtitle = rest.join(' · ')
  const region = regionForRoute(route)
  const place = region ? textFor(region.name, locale) : route.region ?? ''
  const nameSize = name.length > 22 ? 96 : name.length > 14 ? 120 : 150

  const stats = [
    { value: `${Math.round(Number(route.distance_km))} km`, label: t.distance },
    { value: formatDuration(route.duration_minutes), label: t.duration },
    ...(route.elevation_gain_m ? [{ value: `${route.elevation_gain_m} m`, label: t.elevation }] : []),
  ]

  return new ImageResponse(
    (
      <div style={{ width: W, height: H, display: 'flex', flexDirection: 'column', background: BG, color: '#fff', fontFamily: 'Barlow', position: 'relative' }}>
        {/* Route map */}
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <radialGradient id="glow" cx="50%" cy="52%" r="55%">
              <stop offset="0%" stopColor="#1c2030" />
              <stop offset="100%" stopColor={BG} />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width={W} height={H} fill="url(#glow)" />
          {d && <path d={d} fill="none" stroke={RED} strokeOpacity="0.22" strokeWidth="34" strokeLinecap="round" strokeLinejoin="round" />}
          {d && <path d={d} fill="none" stroke={RED} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />}
          {stops.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="11" fill={BG} stroke="#fff" strokeWidth="5" />
          ))}
          {end && <circle cx={end[0]} cy={end[1]} r="22" fill={RED} stroke="#fff" strokeWidth="7" />}
          {start && <circle cx={start[0]} cy={start[1]} r="22" fill="#16a34a" stroke="#fff" strokeWidth="7" />}
        </svg>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: '120px 90px 0', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 18, height: 18, borderRadius: 9, background: RED }} />
            <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: 6, color: RED, textTransform: 'uppercase' }}>
              {place ? `${t.eyebrow} · ${place}` : t.eyebrow}
            </div>
          </div>
          <div style={{ fontSize: nameSize, fontWeight: 800, lineHeight: 0.95, marginTop: 24, textTransform: 'uppercase' }}>
            {name}
          </div>
          {subtitle && (
            <div style={{ fontSize: 50, fontWeight: 600, color: '#c9ccd6', marginTop: 18 }}>{subtitle}</div>
          )}
        </div>

        {/* Stats + footer */}
        <div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', left: 90, right: 90, bottom: 110 }}>
          <div style={{ display: 'flex', gap: 24 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '26px 30px', borderRadius: 28, background: 'rgba(255,255,255,0.07)', border: '2px solid rgba(255,255,255,0.12)' }}>
                <div style={{ fontSize: 64, fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: 34, fontWeight: 600, color: '#9aa0b0' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 56 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 36, fontWeight: 600, color: '#9aa0b0' }}>{t.cta}</div>
              <div style={{ fontSize: 64, fontWeight: 800, color: RED }}>{new URL(getSiteUrl()).host}</div>
            </div>
            <div style={{ fontSize: 44, fontWeight: 600 }}>@mototrip.pt</div>
          </div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: 'Barlow', data: extraBold, weight: 800, style: 'normal' },
        { name: 'Barlow', data: semiBold, weight: 600, style: 'normal' },
      ],
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
    },
  )
}
