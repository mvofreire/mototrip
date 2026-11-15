'use client'

import { useTranslations } from 'next-intl'
import { BedDouble, Coffee, Fuel, Landmark, MapPin, Mountain, Navigation, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import { googleMapsStopUrl } from '@/lib/route-export'
import { trackEvent } from '@/lib/analytics'
import type { RouteStop } from '@/types'
import { cn } from '@/lib/utils'
import { useRouteView } from './route-view-context'

/** One outline icon per stop type, all in the same color */
const STOP_ICONS: Record<string, LucideIcon> = {
  viewpoint: Mountain,
  cafe: Coffee,
  gas_station: Fuel,
  restaurant: UtensilsCrossed,
  landmark: Landmark,
  accommodation: BedDouble,
}

/**
 * Recommended stops in riding order. Each one opens Google Maps with
 * directions from the rider's location to that stop; hovering one (desktop)
 * highlights it on the map.
 */
export function RouteStopList({ stops, routeSlug }: { stops: RouteStop[]; routeSlug: string }) {
  const t = useTranslations()
  const { activeStop, setActiveStop, setMapOpen } = useRouteView()

  return (
    <ol className="flex flex-col gap-2.5">
      {stops.map((stop, i) => {
        const Icon = STOP_ICONS[stop.type] ?? MapPin
        const active = activeStop === stop.id
        return (
          <li
            key={stop.id}
            // Mouse only: on touch screens these fire on tap and would undo "View on map"
            onPointerEnter={(e) => e.pointerType === 'mouse' && setActiveStop(stop.id)}
            onPointerLeave={(e) => e.pointerType === 'mouse' && setActiveStop(null)}
            className={cn(
              'rounded-2xl border bg-muted/40 p-4 transition-[border-color,background-color,transform] duration-200 lg:flex lg:items-center lg:gap-4 lg:hover:-translate-x-0.5',
              active && 'border-primary bg-muted',
            )}
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden />
                <span className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[11px] font-extrabold text-background">
                  {i + 1}
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('route.stop', { number: i + 1 })} · {t(`stopTypes.${stop.type}`)}
                </p>
                <h3 className="mt-0.5 font-bold leading-snug break-words">{stop.name}</h3>
                {stop.description && <p className="mt-1 text-sm text-muted-foreground break-words">{stop.description}</p>}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2 lg:mt-0 lg:flex lg:shrink-0">
              <a
                href={googleMapsStopUrl({ lat: Number(stop.latitude), lng: Number(stop.longitude) })}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('google_maps_open', { route: routeSlug, from: 'stop' })}
                aria-label={t('route.navigateTo', { name: stop.name })}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-transform hover:brightness-110 active:scale-[0.97]"
              >
                <Navigation className="h-4 w-4" aria-hidden />
                <span className="lg:hidden">{t('route.navigateHere')}</span>
                <span className="hidden lg:inline">{t('route.navigate')}</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setActiveStop(stop.id)
                  setMapOpen(true)
                }}
                className="inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-semibold transition-colors hover:bg-muted lg:hidden"
              >
                {t('route.viewOnMap')}
              </button>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
