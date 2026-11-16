'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Map, type OsmMarker } from '@/components/features/maps/map'
import type { LatLng } from '@/lib/route-export'
import type { RouteStop } from '@/types'
import { useRouteView } from './route-view-context'

const PLAY =
  '<svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"/></svg>'
const FLAG =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"><path d="M5 22V3"/><path d="M5 4h12l-2.5 4.5L17 13H5z"/></svg>'

/** Stops share one neutral color; the one hovered in the list turns brand red */
const STOP_COLOR = '#2B313F'

/**
 * Interactive Leaflet map of the route. Only mounted on demand (tap on
 * phones, idle time on desktop) so it never competes with the page's LCP.
 */
export function RouteLiveMap({ coords, stops }: { coords: LatLng[]; stops: RouteStop[] }) {
  const t = useTranslations('route')
  const { activeStop, setActiveStop } = useRouteView()

  const center = useMemo(() => {
    if (!coords.length) {
      const s = stops[0]
      return s ? { lat: Number(s.latitude), lng: Number(s.longitude) } : { lat: 39.5, lng: -8 }
    }
    return {
      lat: coords.reduce((sum, c) => sum + c.lat, 0) / coords.length,
      lng: coords.reduce((sum, c) => sum + c.lng, 0) / coords.length,
    }
  }, [coords, stops])

  const markers = useMemo<OsmMarker[]>(() => {
    const list: OsmMarker[] = stops.map((stop, i) => {
      const active = activeStop === stop.id
      return {
        id: `stop-${stop.id}`,
        position: { lat: Number(stop.latitude), lng: Number(stop.longitude) },
        title: stop.name,
        html: String(i + 1),
        size: active ? 34 : 26,
        color: active ? undefined : STOP_COLOR,
        onClick: () => setActiveStop(stop.id),
      }
    })
    if (coords.length > 1) {
      list.push({ id: 'end', position: coords[coords.length - 1], title: t('end'), html: FLAG, size: 32 })
    }
    if (coords.length > 0) {
      list.push({ id: 'start', position: coords[0], title: t('start'), html: PLAY, size: 32, color: '#0E131B' })
    }
    return list
  }, [stops, coords, activeStop, setActiveStop, t])

  return (
    <Map
      center={center}
      zoom={10}
      polyline={coords}
      markers={markers}
      scrollWheelZoom
      className="route-live-map h-full w-full"
    />
  )
}
