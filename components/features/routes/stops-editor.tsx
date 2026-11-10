'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowDown, ArrowUp, Crosshair, Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Map, type OsmMarker } from '@/components/features/maps/map'
import { RoutesService } from '@/lib/services/routes.service'
import type { RouteStop, RouteWithDetails, StopType } from '@/types'
import { cn } from '@/lib/utils'

const STOP_TYPES: StopType[] = [
  'viewpoint',
  'cafe',
  'gas_station',
  'restaurant',
  'landmark',
  'accommodation',
]

type DraftStop = {
  key: string
  id?: string
  name: string
  description: string
  type: StopType
  latitude: number | null
  longitude: number | null
}

const toDraft = (s: RouteStop): DraftStop => ({
  key: s.id,
  id: s.id,
  name: s.name,
  description: s.description ?? '',
  type: s.type,
  latitude: Number(s.latitude),
  longitude: Number(s.longitude),
})

/**
 * Add, edit, reorder and remove the stops of a route. Positions are picked by
 * clicking on the map.
 */
export function StopsEditor({
  route,
  onSaved,
}: {
  route: RouteWithDetails
  onSaved?: (stops: RouteStop[]) => void
}) {
  const t = useTranslations('editRoute.stops')
  const tTypes = useTranslations('stopTypes')

  const initial = useMemo(
    () => [...(route.stops ?? [])].sort((a, b) => a.order_index - b.order_index).map(toDraft),
    [route.stops],
  )
  const [stops, setStops] = useState<DraftStop[]>(initial)
  const [placing, setPlacing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const line = useMemo(
    () =>
      ((route.polyline_coordinates?.coordinates ?? []) as [number, number][]).map(([lng, lat]) => ({
        lat,
        lng,
      })),
    [route.polyline_coordinates],
  )
  const center = line[Math.floor(line.length / 2)] ?? { lat: 39.5, lng: -8 }

  const markers: OsmMarker[] = stops
    .map((s, i): OsmMarker | null =>
      s.latitude == null || s.longitude == null
        ? null
        : {
            id: s.key,
            position: { lat: s.latitude, lng: s.longitude },
            title: s.name || t('untitled'),
            html: String(i + 1),
            // Brand gradient; blue while the stop is being placed
            color: placing === s.key ? '#2563eb' : undefined,
            size: 26,
          },
    )
    .filter((m): m is OsmMarker => m !== null)

  const update = (key: string, patch: Partial<DraftStop>) =>
    setStops((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)))

  const move = (index: number, dir: -1 | 1) =>
    setStops((prev) => {
      const next = [...prev]
      const j = index + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[index], next[j]] = [next[j], next[index]]
      return next
    })

  const add = () => {
    const key = `new-${crypto.randomUUID()}`
    setStops((prev) => [
      ...prev,
      { key, name: '', description: '', type: 'viewpoint', latitude: null, longitude: null },
    ])
    setPlacing(key)
    setMessage(null)
  }

  const invalid = stops.some((s) => !s.name.trim() || s.latitude == null || s.longitude == null)

  const save = async () => {
    if (invalid) {
      setMessage({ ok: false, text: t('incomplete') })
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const saved = await RoutesService.saveStops(
        route.id,
        stops.map((s) => ({
          id: s.id,
          name: s.name.trim(),
          description: s.description.trim() || null,
          type: s.type,
          latitude: s.latitude!,
          longitude: s.longitude!,
        })),
      )
      setStops(saved.map(toDraft))
      setPlacing(null)
      setMessage({ ok: true, text: t('saved') })
      onSaved?.(saved)
    } catch (e) {
      console.error('Error saving stops:', e)
      setMessage({ ok: false, text: t('saveFailed') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="mr-2 h-4 w-4" />
          {t('add')}
        </Button>
      </div>

      <div
        className={cn(
          'relative h-[320px] overflow-hidden rounded-md border',
          placing && 'ring-2 ring-blue-500',
        )}
      >
        <Map
          center={center}
          zoom={9}
          scrollWheelZoom
          polyline={line}
          markers={markers}
          onMapClick={
            placing
              ? (p) => {
                  update(placing, { latitude: p.lat, longitude: p.lng })
                  setPlacing(null)
                }
              : undefined
          }
        />
        {placing && (
          <div className="pointer-events-none absolute left-1/2 top-3 z-[500] -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white shadow">
            {t('clickMap')}
          </div>
        )}
      </div>

      {stops.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">{t('empty')}</p>
      ) : (
        <ol className="space-y-3">
          {stops.map((s, i) => (
            <li key={s.key} className="space-y-3 rounded-md border p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {i + 1}
                </span>
                <Input
                  aria-label={t('name')}
                  placeholder={t('name')}
                  value={s.name}
                  onChange={(e) => update(s.key, { name: e.target.value })}
                  className="h-9"
                />
                <select
                  aria-label={t('type')}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={s.type}
                  onChange={(e) => update(s.key, { type: e.target.value as StopType })}
                >
                  {STOP_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {tTypes(type)}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                aria-label={t('notes')}
                placeholder={t('notes')}
                value={s.description}
                onChange={(e) => update(s.key, { description: e.target.value })}
                className="h-9"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Button
                  type="button"
                  variant={placing === s.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPlacing(placing === s.key ? null : s.key)}
                >
                  <Crosshair className="mr-2 h-4 w-4" />
                  {s.latitude == null
                    ? t('setOnMap')
                    : `${s.latitude.toFixed(4)}, ${s.longitude!.toFixed(4)}`}
                </Button>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={t('moveUp')}
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={t('moveDown')}
                    disabled={i === stops.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={t('remove')}
                    onClick={() => {
                      setStops((prev) => prev.filter((x) => x.key !== s.key))
                      if (placing === s.key) setPlacing(null)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        {message && (
          <span className={cn('text-sm', message.ok ? 'text-green-600' : 'text-destructive')}>
            {message.text}
          </span>
        )}
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {t('save')}
        </Button>
      </div>
    </Card>
  )
}
