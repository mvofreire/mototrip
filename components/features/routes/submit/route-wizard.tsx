'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Check, Loader2, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { isStaff } from '@/lib/auth/roles'
import { useRouteBuilder } from '@/hooks/use-route-builder'
import { useRouteBuilderAccess } from '@/hooks/use-route-builder-access'
import { useRoutesCreateMutation, useRoutesUpdateMutation } from '@/hooks/use-routes'
import { gpxPointsToGeoJSON, type GPXData, type GPXPoint } from '@/lib/gpx-parser'
import {
  buildRouteTitle,
  titlePlaces,
  positionOnTrack,
  regionAt,
  suggestCategory,
  suggestDifficulty,
  suggestRouteType,
  trackFacts,
  usableTrackName,
  type Category,
  type Difficulty,
  type RouteType,
} from '@/lib/routes/autofill'
import { reverseGeocode } from '@/lib/routes/geocode-client'
import { PlacesService } from '@/lib/services/places.service'
import { PhotosService } from '@/lib/services/photos.service'
import { RoutesService } from '@/lib/services/routes.service'
import { RouteStorage } from '@/lib/storage/storage.service'
import { renderRouteThumbnails } from '@/lib/map-thumbnail'
import { trackEvent } from '@/lib/analytics'
import type { StopType } from '@/types'
import type { Database } from '@/types/database.types'
import { cn } from '@/lib/utils'
import { DetailsStep, ReviewStep, StopsPhotosStep, TrackStep } from './wizard-steps'

type RouteInsert = Database['public']['Tables']['routes']['Insert']

/** Keeps a route being drawn on the map across reloads */
const DRAFT_STORAGE_KEY = 'mototrip:route-builder-draft'

export interface WizardStop {
  key: string
  name: string
  description: string
  type: StopType
  lat: number
  lng: number
}
export interface PlacedStop extends WizardStop {
  km: number
  offRouteKm: number
}
export interface WizardPhoto {
  key: string
  file: File
  url: string
}

export interface Values {
  name: string
  distanceKm: number
  durationMin: number
  elevationGainM: number
  difficulty: Difficulty
  category: Category
  routeType: RouteType | ''
  country: string
  regionId: string
  description: string
}
export type AutoKey = Exclude<keyof Values, 'description'>

interface Geo {
  signature: string
  start: string | null
  end: string | null
  road: string | null
  countryCode: string | null
}

const newKey = () => crypto.randomUUID()

/** A new track resets the calculated values but keeps what the rider wrote */
const keepWords = (prev: Partial<Values>): Partial<Values> =>
  prev.description === undefined ? {} : { description: prev.description }

/** Changes only when the track really changes (not on every builder render) */
function trackSignature(points: GPXPoint[]) {
  if (points.length < 2) return ''
  const p = (x: GPXPoint) => `${x.lat.toFixed(4)},${x.lng.toFixed(4)}`
  return `${points.length}|${p(points[0])}|${p(points[Math.floor(points.length / 2)])}|${p(points[points.length - 1])}`
}

type Places = Awaited<ReturnType<typeof PlacesService.list>>

/** Shape shared with the step components */
export interface WizardModel {
  locale: string
  staff: boolean
  source: 'gpx' | 'map'
  setSource: (s: 'gpx' | 'map') => void
  canDraw: boolean
  builder: ReturnType<typeof useRouteBuilder>
  gpx: { file: File; data: GPXData } | null
  onGpx: (file: File, data: GPXData) => void
  clearGpx: () => void
  points: GPXPoint[]
  hasTrack: boolean
  facts: ReturnType<typeof trackFacts> | null
  geoLoading: boolean
  values: Values
  auto: Values
  edited: (k: AutoKey) => boolean
  setValue: <K extends keyof Values>(k: K, v: Values[K]) => void
  resetValue: (k: AutoKey) => void
  title: string
  /** Start, middle and end of the title, ready to show */
  places: string[]
  countries: Places['countries']
  regions: Places['regions']
  region: Places['regions'][number] | null
  regionsLoading: boolean
  refetchPlaces: () => unknown
  stops: PlacedStop[]
  setStops: React.Dispatch<React.SetStateAction<WizardStop[]>>
  via: PlacedStop | null
  viaText: string
  setViaText: (v: string) => void
  photos: WizardPhoto[]
  setPhotos: React.Dispatch<React.SetStateAction<WizardPhoto[]>>
  checks: { key: string; ok: boolean; step: number; optional?: boolean }[]
  go: (step: number) => void
}

export const STEPS = ['track', 'details', 'stops', 'review'] as const

export function RouteWizard({ locale }: { locale: string }) {
  const t = useTranslations('submitWizard')
  const router = useRouter()
  const { user } = useAuth()
  const staff = isStaff(user)
  const createRoute = useRoutesCreateMutation()
  const updateRoute = useRoutesUpdateMutation()

  const [step, setStep] = useState(0)
  const topRef = useRef<HTMLDivElement>(null)

  // ---- track: GPX file (default) or drawn on the map (behind the flag)
  const canDraw = useRouteBuilderAccess()
  const [sourceChoice, setSource] = useState<'gpx' | 'map'>('gpx')
  const source = canDraw ? sourceChoice : 'gpx'
  const [gpx, setGpx] = useState<{ file: File; data: GPXData } | null>(null)
  const builder = useRouteBuilder({ storageKey: DRAFT_STORAGE_KEY })
  const { draft } = builder

  const points: GPXPoint[] = useMemo(
    () => (source === 'gpx' ? (gpx?.data.points ?? []) : draft.points.length > 1 ? draft.points : []),
    [source, gpx, draft.points],
  )
  const hasTrack = points.length > 1
  const facts = useMemo(() => {
    if (!hasTrack) return null
    return source === 'gpx' && gpx
      ? trackFacts(points, { distanceKm: gpx.data.totalDistance, elevationGainM: gpx.data.elevationGain })
      : trackFacts(points, {
          distanceKm: draft.distanceKm,
          elevationGainM: draft.elevationGainM,
          durationMin: draft.durationMin,
        })
  }, [hasTrack, source, gpx, points, draft.distanceKm, draft.elevationGainM, draft.durationMin])

  // ---- place names for the title (start, end, main road)
  const signature = trackSignature(points)
  const [geo, setGeo] = useState<Geo | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  useEffect(() => {
    if (!signature) return
    let cancelled = false
    const timer = setTimeout(async () => {
      setGeoLoading(true)
      const first = points[0]
      const last = points[points.length - 1]
      const start = await reverseGeocode(first)
      const end = await reverseGeocode(last)
      const road = await reverseGeocode(points[Math.floor(points.length / 2)], 'road')
      if (cancelled) return
      setGeo({
        signature,
        start: start?.place ?? null,
        end: end?.place ?? null,
        road: road?.road ?? null,
        countryCode: start?.countryCode ?? null,
      })
      setGeoLoading(false)
    }, 600)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // points are captured through `signature`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])

  // ---- countries and regions
  const placesQuery = useQuery({ queryKey: ['places'], queryFn: PlacesService.list, staleTime: 10 * 60 * 1000 })
  const countries = placesQuery.data?.countries ?? []
  const regions = placesQuery.data?.regions ?? []

  // ---- stops
  const [stops, setStops] = useState<WizardStop[]>([])
  const placedStops: PlacedStop[] = useMemo(
    () =>
      stops
        .map((s) => ({ ...s, ...(hasTrack ? positionOnTrack(points, s) : { km: 0, offRouteKm: 0 }) }))
        .sort((a, b) => a.km - b.km),
    [stops, points, hasTrack],
  )
  /** Place in the middle of the title. undefined: the stop nearest the middle of the ride */
  const [viaText, setViaText] = useState<string | undefined>(undefined)
  const autoVia = useMemo(() => {
    if (!facts) return ''
    const mid = facts.distanceKm / 2
    return (
      placedStops
        .filter((s) => s.type !== 'gas_station' && s.offRouteKm <= 2 && s.name.trim())
        .sort((a, b) => Math.abs(a.km - mid) - Math.abs(b.km - mid))[0]?.name.trim() ?? ''
    )
  }, [placedStops, facts])
  const viaName = viaText ?? autoVia
  const via = placedStops.find((s) => s.name.trim() && s.name.trim() === viaName.trim()) ?? null

  // ---- photos (uploaded after the route exists: the storage path needs its id)
  const [photos, setPhotos] = useState<WizardPhoto[]>([])
  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.url)), []) // eslint-disable-line react-hooks/exhaustive-deps

  // ---- values: calculated from the track unless the rider changed them
  const auto: Values = useMemo(() => {
    const geoNow = geo?.signature === signature ? geo : null
    // Country from the start's address; it narrows the region boxes at borders
    const geoCountry =
      geoNow?.countryCode && countries.some((c) => c.code === geoNow.countryCode) ? geoNow.countryCode : null
    const region = hasTrack ? regionAt(regions, points[0], geoCountry) : undefined
    const country = geoCountry ?? region?.country ?? ''
    return {
      name:
        (source === 'gpx' ? usableTrackName(gpx?.data.name) : null) ??
        geoNow?.road ??
        geoNow?.start ??
        '',
      distanceKm: facts?.distanceKm ?? 0,
      durationMin: facts?.durationMin ?? 0,
      elevationGainM: facts?.elevationGainM ?? 0,
      difficulty: facts ? suggestDifficulty(facts) : 'moderate',
      category: facts ? suggestCategory(facts) : 'scenic',
      routeType: facts ? suggestRouteType(facts) : '',
      country,
      regionId: region && region.country === country ? region.id : '',
      description: '',
    }
  }, [geo, signature, hasTrack, regions, countries, points, source, gpx, facts])

  const [overrides, setOverrides] = useState<Partial<Values>>({})
  const values: Values = { ...auto, ...overrides }
  const edited = (k: AutoKey) => k in overrides
  const setValue = useCallback(<K extends keyof Values>(k: K, v: Values[K]) => {
    setOverrides((prev) => ({ ...prev, [k]: v }))
  }, [])
  const resetValue = useCallback((k: AutoKey) => {
    setOverrides((prev) => {
      const next = { ...prev }
      delete next[k]
      return next
    })
  }, [])

  // A new track: forget the old numbers, keep the rider's words
  const onGpx = (file: File, data: GPXData) => {
    setGpx({ file, data })
    setStops(
      data.waypoints.map((w) => ({
        key: newKey(),
        name: w.name.slice(0, 120),
        description: w.description,
        type: w.type as StopType,
        lat: w.lat,
        lng: w.lng,
      })),
    )
    setViaText(undefined)
    setOverrides(keepWords)
  }
  const clearGpx = () => {
    setGpx(null)
    setStops([])
    setViaText(undefined)
    setOverrides(keepWords)
  }

  const region = regions.find((r) => r.id === values.regionId) ?? null
  const geoNow = geo?.signature === signature ? geo : null
  const places = titlePlaces([geoNow?.start, viaName, geoNow?.end])
  const title = buildRouteTitle(values.name, places)

  // ---- completeness
  const checks = [
    { key: 'track', ok: hasTrack, step: 0 },
    { key: 'title', ok: values.name.trim().length > 1, step: 1 },
    { key: 'place', ok: !!values.country && !!region, step: 1 },
    { key: 'numbers', ok: values.distanceKm > 0 && values.durationMin > 0, step: 1 },
    { key: 'stops', ok: stops.length > 0, step: 2, optional: true },
    { key: 'photos', ok: photos.length > 0, step: 2, optional: true },
  ]
  const ready = checks.every((c) => c.ok || c.optional)
  const stepReady = [hasTrack, checks.slice(1, 4).every((c) => c.ok), true, ready]

  // ---- submit
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const submit = async () => {
    if (!ready || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) throw new Error(t('errors.login'))

      const routeData: RouteInsert = {
        user_id: authUser.id,
        title,
        description: values.description.trim() || null,
        difficulty: values.difficulty,
        distance_km: values.distanceKm,
        duration_minutes: values.durationMin,
        elevation_gain_m: values.elevationGainM,
        polyline_coordinates: gpxPointsToGeoJSON(points),
        region: region?.route_region ?? null,
        country: values.country || null,
        route_type: values.routeType || null,
        thumbnail_url: null,
        category: values.category,
      }
      const result = await createRoute.mutateAsync(routeData)
      trackEvent('route_created_success', {
        route: result.slug ?? result.id,
        source,
        status: result.status ?? null,
        country: result.country ?? null,
        stops: placedStops.length,
        photos: photos.length,
      })
      fetch('/api/routes/notify-curator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routeId: result.id }),
      }).catch((e) => console.warn('Could not notify curators:', e))

      // The rest must not fail the submission: everything can be fixed in the editor
      try {
        const images = await renderRouteThumbnails(points)
        const url = await RouteStorage.uploadRouteThumbnails(images, result.id)
        await updateRoute.mutateAsync({ id: result.id, routeData: { thumbnail_url: `${url}?v=${Date.now()}` } })
      } catch (e) {
        console.warn('Could not create route thumbnail:', e)
      }
      if (placedStops.length) {
        try {
          await RoutesService.saveStops(
            result.id,
            placedStops.map((s) => ({
              name: s.name.trim().slice(0, 120) || t('stops.untitled'),
              description: s.description.trim() || null,
              type: s.type,
              latitude: s.lat,
              longitude: s.lng,
            })),
          )
        } catch (e) {
          console.warn('Could not save the route stops:', e)
        }
      }
      for (const [i, photo] of photos.entries()) {
        try {
          await PhotosService.upload(result.id, authUser.id, photo.file, i)
        } catch (e) {
          console.warn('Could not upload a route photo:', e)
        }
      }
      if (source === 'map') builder.reset()
      setDone(true)
      setTimeout(() => router.push(`/${locale}/profile#my-routes`), 3500)
    } catch (e) {
      console.error('Error submitting route:', e)
      setError(e instanceof Error ? e.message : t('errors.generic'))
    } finally {
      setSubmitting(false)
    }
  }

  const go = (to: number) => {
    setStep(to)
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const model: WizardModel = {
    locale,
    staff,
    source,
    setSource,
    canDraw,
    builder,
    gpx,
    onGpx,
    clearGpx,
    points,
    hasTrack,
    facts,
    geoLoading,
    values,
    auto,
    edited,
    setValue,
    resetValue,
    title,
    places,
    countries,
    regions,
    region,
    regionsLoading: placesQuery.isLoading,
    refetchPlaces: placesQuery.refetch,
    stops: placedStops,
    setStops,
    via,
    viaText: viaName,
    setViaText,
    photos,
    setPhotos,
    checks,
    go,
  }

  if (done) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center animate-in fade-in zoom-in-95 duration-300">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-500/15 text-brand-600">
          <Send className="h-7 w-7" aria-hidden />
        </span>
        <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
          {t('done.badge')}
        </span>
        <h2 className="font-display text-3xl font-extrabold uppercase leading-none">{t('done.title')}</h2>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{t('done.message')}</p>
      </div>
    )
  }

  const last = step === STEPS.length - 1

  return (
    <div ref={topRef} className="scroll-mt-20">
      <header className="mb-5 flex flex-col gap-1.5">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{t('eyebrow')}</span>
        <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-extrabold uppercase leading-[0.95]">{t('title')}</h1>
      </header>

      {/* Stepper */}
      <nav aria-label={t('stepsLabel')} className="mb-2 grid grid-cols-4 gap-1.5 sm:mb-8">
        {STEPS.map((key, i) => {
          const reachable = i <= step || stepReady.slice(0, i).every(Boolean)
          return (
            <button
              key={key}
              type="button"
              disabled={!reachable}
              onClick={() => go(i)}
              aria-current={i === step ? 'step' : undefined}
              className="group flex min-w-0 flex-col gap-2 text-left disabled:cursor-not-allowed"
            >
              <span className="h-1 overflow-hidden rounded-full bg-border">
                <span
                  className="block h-full rounded-full bg-brand-600 transition-[width] duration-500"
                  style={{ width: i < step ? '100%' : i === step ? '50%' : '0%' }}
                />
              </span>
              <span
                className={cn(
                  'hidden items-center gap-2 text-sm font-semibold sm:flex',
                  i === step ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                <span
                  className={cn(
                    'grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border text-[11px]',
                    i < step && 'border-brand-600 bg-brand-600 text-white',
                    i === step && 'border-brand-600 text-brand-600',
                  )}
                >
                  {i < step ? <Check className="h-3 w-3" aria-hidden /> : i + 1}
                </span>
                <span className="truncate">{t(`steps.${key}`)}</span>
              </span>
            </button>
          )
        })}
      </nav>
      <p className="mb-6 text-sm text-muted-foreground sm:hidden">
        {t('stepOf', { n: step + 1, total: STEPS.length })} · <b className="text-foreground">{t(`steps.${STEPS[step]}`)}</b>
      </p>

      <div key={step} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {step === 0 && <TrackStep w={model} />}
        {step === 1 && <DetailsStep w={model} />}
        {step === 2 && <StopsPhotosStep w={model} />}
        {step === 3 && <ReviewStep w={model} />}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Actions: sticky on phones */}
      <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex gap-2.5 border-t bg-background/95 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:static sm:mx-0 sm:justify-between sm:bg-transparent sm:px-0 sm:pb-0 sm:backdrop-blur-none">
        <button
          type="button"
          onClick={() => (step === 0 ? router.back() : go(step - 1))}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border px-4 font-semibold transition-colors hover:bg-muted sm:min-h-11"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {step === 0 ? t('cancel') : t('back')}
        </button>
        {last ? (
          <button
            type="button"
            onClick={submit}
            disabled={!ready || submitting}
            className={cn(
              'inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:min-h-11',
              ready && !submitting && 'cta-pulse',
            )}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
            {submitting ? t('submitting') : t('submit')}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => go(step + 1)}
            disabled={!stepReady[step]}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:min-h-11"
          >
            {t('next')}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  )
}
