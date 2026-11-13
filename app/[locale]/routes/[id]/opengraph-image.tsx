import { ImageResponse } from 'next/og'
import { RoutesService } from '@/lib/services/routes.service'
import { localizeRoute } from '@/lib/localize'

// Share card for a route: its map/cover on the right, title and numbers on the left
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'MotoTrip'
export const revalidate = 3600

const hours = (minutes: number) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h ? `${h}h${m ? String(m).padStart(2, '0') : ''}` : `${m} min`
}

export default async function RouteOgImage({ params }: { params: { id: string; locale: string } }) {
  const route = await RoutesService.getRouteByIdOrSlug(params.id)
    .then((r) => localizeRoute(r, params.locale))
    .catch(() => null)

  const cover =
    route &&
    ([...(route.photos ?? [])].sort((a, b) => a.order_index - b.order_index)[0]?.url || route.thumbnail_url)
  // Satori can't decode WebP/AVIF; leave the panel plain for those
  const image = cover && !/\.(webp|avif)(\?|$)/i.test(cover) ? cover : null

  const stats = route
    ? [
        `${Math.round(Number(route.distance_km))} km`,
        route.duration_minutes ? hours(route.duration_minutes) : null,
        route.elevation_gain_m ? `+${route.elevation_gain_m} m` : null,
      ].filter(Boolean)
    : []

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0d0f14', color: '#f5f6f8' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 640, padding: 64 }}>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 800, letterSpacing: 2, color: '#f97316' }}>MOTOTRIP</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {route?.region && <div style={{ display: 'flex', fontSize: 28, color: '#9ca3af' }}>{route.region}</div>}
            <div style={{ display: 'flex', fontSize: route && route.title.length > 40 ? 52 : 64, fontWeight: 800, lineHeight: 1.1 }}>
              {route?.title ?? 'MotoTrip'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 28, fontSize: 30, color: '#d1d5db' }}>
            {stats.map((s) => (
              <div key={s as string} style={{ display: 'flex' }}>{s}</div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', width: 560, height: '100%', background: '#1f2937' }}>
          {image && (
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            <img src={image} width={560} height={630} style={{ objectFit: 'cover', width: 560, height: 630 }} />
          )}
        </div>
      </div>
    ),
    size,
  )
}
