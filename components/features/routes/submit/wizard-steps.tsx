'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Check,
  Crosshair,
  FileUp,
  ImagePlus,
  Loader2,
  MapPin,
  Plus,
  Route as RouteIcon,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { Map, type OsmMarker } from '@/components/features/maps/map'
import { RouteBuilder } from '@/components/features/routes/route-builder/route-builder'
import { parseGPXFile } from '@/lib/gpx-parser'
import { routeSvgPath } from '@/lib/route-export'
import { ACCEPTED_PHOTO_TYPES } from '@/lib/services/photos.service'
import { PlacesService, placeName } from '@/lib/services/places.service'
import { cn, formatDuration } from '@/lib/utils'
import type { StopType } from '@/types'
import type { WizardModel } from './route-wizard'
import { GpxStudioGuide } from './gpx-studio-guide'
import { AutoBadge, ChoiceChips, DurationField, FieldLabel, NumberField, WizardCard } from './wizard-fields'

const STOP_TYPES: StopType[] = ['viewpoint', 'cafe', 'gas_station', 'restaurant', 'landmark', 'accommodation']
const sectionTitle = 'font-display text-[22px] font-bold uppercase leading-none tracking-[0.01em]'
const input =
  'w-full min-h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary'

function TrackMap({ w, className, onMapClick }: { w: WizardModel; className?: string; onMapClick?: (p: { lat: number; lng: number }) => void }) {
  const t = useTranslations('submitWizard.stops')
  const first = w.points[0]
  const last = w.points[w.points.length - 1]
  const markers: OsmMarker[] = [
    { id: 'start', position: first, title: t('start'), html: '', color: '#0f1218', size: 18 },
    ...w.stops.map((s, i) => ({
      id: s.key,
      position: { lat: s.lat, lng: s.lng },
      title: s.name,
      html: String(i + 1),
      color: s.offRouteKm > 2 ? '#d97706' : undefined,
      size: 26,
    })),
    { id: 'end', position: last, title: t('end'), html: '', size: 22 },
  ]
  return (
    <div className={cn('route-live-map relative overflow-hidden rounded-2xl border', className)}>
      <Map
        center={w.points[Math.floor(w.points.length / 2)]}
        zoom={10}
        scrollWheelZoom
        polyline={w.points}
        polylineColor="#e11d2e"
        markers={markers}
        onMapClick={onMapClick}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ step 1 */

export function TrackStep({ w }: { w: WizardModel }) {
  const t = useTranslations('submitWizard.track')
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const readFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.gpx')) {
      setError(t('notGpx'))
      return
    }
    setError(null)
    setLoading(true)
    try {
      w.onGpx(file, await parseGPXFile(file))
    } catch (e) {
      console.error('Error parsing GPX:', e)
      setError(t('unreadable'))
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept=".gpx"
      className="hidden"
      onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])}
    />
  )

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-4">
        <h2 className={sectionTitle}>{t('heading')}</h2>

        {w.canDraw && (
          <div role="tablist" aria-label={t('sourceLabel')} className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            {(['gpx', 'map'] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={w.source === option}
                onClick={() => w.setSource(option)}
                className={cn(
                  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors',
                  w.source === option ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {option === 'gpx' ? <FileUp className="h-4 w-4" aria-hidden /> : <RouteIcon className="h-4 w-4" aria-hidden />}
                {option === 'gpx' ? t('sourceGpx') : t('sourceMap')}
              </button>
            ))}
          </div>
        )}

        {w.source === 'map' ? (
          <RouteBuilder builder={w.builder} allowStops={false} />
        ) : w.gpx ? (
          <>
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-emerald-500/10 p-3.5 animate-in fade-in duration-300">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
                <Check className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-[1_1_calc(100%-44px)] sm:flex-1">
                <strong className="block break-all">{w.gpx.file.name}</strong>
                <span className="text-sm text-muted-foreground">
                  {t('fileSummary', {
                    points: w.gpx.data.points.length,
                    km: w.facts?.distanceKm ?? 0,
                    stops: w.gpx.data.waypoints.length,
                  })}
                </span>
              </div>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border bg-background px-3 text-sm font-semibold hover:bg-muted sm:flex-none"
              >
                {t('replace')}
              </button>
              <button
                type="button"
                onClick={w.clearGpx}
                className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg px-3 text-sm font-semibold text-muted-foreground hover:bg-muted sm:flex-none"
              >
                {t('remove')}
              </button>
              {fileInput}
            </div>
            <TrackMap w={w} className="h-[280px] sm:h-[380px]" />
            {w.facts && (
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-lg bg-muted px-2.5 py-1 font-semibold tabular-nums">{w.facts.distanceKm} km</span>
                <span className="rounded-lg bg-muted px-2.5 py-1 font-semibold tabular-nums">↑ {w.facts.elevationGainM} m</span>
                <span className="rounded-lg bg-muted px-2.5 py-1 font-semibold">{formatDuration(w.facts.durationMin)}</span>
              </div>
            )}
          </>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              const file = e.dataTransfer.files[0]
              if (file) readFile(file)
            }}
            className={cn(
              'flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed bg-card p-8 text-center transition-colors',
              dragging ? 'border-brand-600 bg-brand-500/10' : 'border-border',
            )}
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/15 text-brand-600">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" aria-hidden /> : <Upload className="h-6 w-6" aria-hidden />}
            </span>
            <div>
              <p className="font-semibold">{t('dropTitle')}</p>
              <p className="text-sm text-muted-foreground">{t('dropHint')}</p>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-foreground px-5 text-sm font-semibold text-background"
            >
              <FileUp className="h-4 w-4" aria-hidden />
              {t('choose')}
            </button>
            {fileInput}
          </div>
        )}
        {error && (
          <p role="alert" className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
      <GpxStudioGuide locale={w.locale} />
    </div>
  )
}

/* ------------------------------------------------------------------ step 2 */

export function DetailsStep({ w }: { w: WizardModel }) {
  const t = useTranslations('submitWizard.details')
  const tSubmit = useTranslations('submit')
  const tDiff = useTranslations('difficulty')
  const tCat = useTranslations('categories')
  const nf = new Intl.NumberFormat(w.locale, { maximumFractionDigits: 1 })
  const [titleOpen, setTitleOpen] = useState(!w.values.name)
  const badge = (k: Parameters<WizardModel['edited']>[0], label?: string) => (
    <AutoBadge state={w.edited(k) ? 'edited' : 'auto'} onReset={() => w.resetValue(k)} label={label} />
  )
  const f = w.facts
  const via = w.places
  // The places are added after the |; a name with them typed in repeats them
  const nameHasPlaces = /[|>]/.test(w.values.name)

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-4">
        <div>
          <h2 className={sectionTitle}>{t('heading')}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{t('intro')}</p>
        </div>

        {/* Title */}
        <WizardCard className="flex flex-col gap-3">
          <FieldLabel badge={badge('name', t('titleAuto'))}>{t('titleLabel')}</FieldLabel>
          <div className="flex flex-col gap-1 rounded-xl border bg-muted/50 px-4 py-3">
            <span className="font-display text-[clamp(28px,4vw,38px)] font-extrabold uppercase leading-[0.95]">
              {w.values.name || t('titleEmpty')}
            </span>
            <span className="text-sm text-foreground/80">
              {via.length
                ? via.map((p, i) => (
                    <span key={i}>
                      {i > 0 && <span className="px-1 text-brand-600">›</span>}
                      {p}
                    </span>
                  ))
                : w.geoLoading
                  ? t('placesLoading')
                  : t('placesMissing')}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-expanded={titleOpen}
              onClick={() => setTitleOpen((o) => !o)}
              className="inline-flex min-h-9 items-center rounded-lg border px-3 text-sm font-semibold hover:bg-muted"
            >
              {titleOpen ? t('titleClose') : t('titleEdit')}
            </button>
            <span className="text-xs text-muted-foreground">{t('titleHint')}</span>
          </div>
          {titleOpen && (
            <div className="grid gap-3 sm:grid-cols-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="wz-name" className="text-sm font-semibold">
                  {t('nameLabel')}
                </label>
                <input
                  id="wz-name"
                  className={input}
                  maxLength={40}
                  value={w.values.name}
                  placeholder={t('namePlaceholder')}
                  onChange={(e) => w.setValue('name', e.target.value)}
                />
                {nameHasPlaces ? (
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{t('nameHasPlaces')}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">{t('nameHint')}</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="wz-via" className="text-sm font-semibold">
                  {t('viaLabel')}
                </label>
                <input
                  id="wz-via"
                  className={input}
                  list="wz-via-stops"
                  maxLength={60}
                  value={w.viaText}
                  placeholder={t('viaPlaceholder')}
                  onChange={(e) => w.setViaText(e.target.value)}
                />
                <datalist id="wz-via-stops">
                  {w.stops
                    .filter((s) => s.name.trim())
                    .map((s) => (
                      <option key={s.key} value={s.name.trim()} />
                    ))}
                </datalist>
                <span className="text-xs text-muted-foreground">{t('viaHint')}</span>
              </div>
            </div>
          )}
        </WizardCard>

        {/* Numbers */}
        <WizardCard className="grid gap-3 sm:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-col items-start gap-1.5">
              <label htmlFor="wz-km" className="text-sm font-semibold">
                {tSubmit('distanceLabel')}
              </label>
              {badge('distanceKm')}
            </div>
            <NumberField id="wz-km" value={w.values.distanceKm} step={1} unit="km" min={1} label={tSubmit('distanceLabel')} onChange={(v) => w.setValue('distanceKm', v)} />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-col items-start gap-1.5">
              <label htmlFor="wz-dur-h" className="text-sm font-semibold">
                {tSubmit('durationLabel')}
              </label>
              {badge('durationMin')}
            </div>
            <DurationField id="wz-dur" minutes={w.values.durationMin} onChange={(v) => w.setValue('durationMin', v)} />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-col items-start gap-1.5">
              <label htmlFor="wz-gain" className="text-sm font-semibold">
                {tSubmit('elevationLabel')}
              </label>
              {badge('elevationGainM')}
            </div>
            <NumberField id="wz-gain" value={w.values.elevationGainM} step={10} unit="m" label={tSubmit('elevationLabel')} onChange={(v) => w.setValue('elevationGainM', v)} />
            {f && f.maxElevationM === null && !w.edited('elevationGainM') && (
              <span className="text-xs text-muted-foreground">{t('noElevation')}</span>
            )}
          </div>
        </WizardCard>

        {/* Difficulty, category, type */}
        <WizardCard className="grid gap-5 md:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-2">
            <FieldLabel badge={badge('difficulty', t('suggested'))}>{tSubmit('difficultyLabel')}</FieldLabel>
            <ChoiceChips
              label={tSubmit('difficultyLabel')}
              value={w.values.difficulty}
              suggested={w.auto.difficulty}
              onChange={(v) => w.setValue('difficulty', v)}
              options={[
                { value: 'easy', label: tDiff('easy') },
                { value: 'moderate', label: tDiff('moderate') },
                { value: 'challenging', label: tDiff('challenging') },
                { value: 'expert', label: tDiff('expert') },
              ]}
            />
            {f && (
              <span className="text-xs text-muted-foreground">
                {t('whyDifficulty', { climb: Math.round(f.elevationGainM / Math.max(1, f.distanceKm)), curves: nf.format(f.curvesPerKm) })}
              </span>
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <FieldLabel badge={badge('category', t('suggested'))}>{tSubmit('category')}</FieldLabel>
            <ChoiceChips
              label={tSubmit('category')}
              value={w.values.category}
              suggested={w.auto.category}
              onChange={(v) => w.setValue('category', v)}
              options={[
                { value: 'scenic', label: tCat('scenic') },
                { value: 'mountain', label: tCat('mountain') },
                { value: 'coastal', label: tCat('coastal') },
                { value: 'weekend', label: tCat('weekend') },
                { value: 'adventure', label: tCat('adventure') },
              ]}
            />
            {f?.maxElevationM != null && (
              <span className="text-xs text-muted-foreground">{t('whyCategory', { max: f.maxElevationM })}</span>
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <FieldLabel badge={badge('routeType', t('suggested'))}>{tSubmit('routeType')}</FieldLabel>
            <ChoiceChips
              label={tSubmit('routeType')}
              value={w.values.routeType}
              suggested={w.auto.routeType || null}
              onChange={(v) => w.setValue('routeType', v)}
              options={[
                { value: 'loop', label: t('typeLoop') },
                { value: 'out_and_back', label: t('typeOutAndBack') },
              ]}
            />
            {f && (
              <span className="text-xs text-muted-foreground">
                {f.endGapKm < 1.5 ? t('whyLoop') : t('whyOneWay', { km: nf.format(f.endGapKm) })}
              </span>
            )}
          </div>
        </WizardCard>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <PlaceCard w={w} />
        <WizardCard className="flex flex-col gap-2">
          <FieldLabel htmlFor="wz-desc" badge={<span className="text-xs tabular-nums text-muted-foreground">{w.values.description.length}/1000</span>}>
            {t('descriptionLabel')}
          </FieldLabel>
          <textarea
            id="wz-desc"
            maxLength={1000}
            rows={5}
            className={cn(input, 'min-h-[120px] py-2.5')}
            placeholder={t('descriptionPlaceholder')}
            value={w.values.description}
            onChange={(e) => w.setValue('description', e.target.value)}
          />
          <span className="text-xs text-muted-foreground">{t('descriptionHint')}</span>
        </WizardCard>
      </div>
    </div>
  )
}

function PlaceCard({ w }: { w: WizardModel }) {
  const t = useTranslations('submitWizard.place')
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const regions = w.regions
    .filter((r) => r.country === w.values.country)
    .sort((a, b) => placeName(a.name, w.locale).localeCompare(placeName(b.name, w.locale), w.locale))
  const detected = !w.edited('country') && !w.edited('regionId') && !!w.auto.regionId

  const create = async () => {
    if (name.trim().length < 2) return
    setSaving(true)
    setError(null)
    try {
      const region = await PlacesService.createRegion({ country: w.values.country, name, nameEn })
      await w.refetchPlaces()
      w.setValue('regionId', region.id)
      setCreating(false)
      setName('')
      setNameEn('')
    } catch (e) {
      console.error('Could not create region:', e)
      setError(t('createFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <WizardCard className="flex flex-col gap-3">
      <FieldLabel
        badge={
          detected ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[11.5px] font-semibold text-sky-700 dark:text-sky-300">
              <MapPin className="h-3 w-3" aria-hidden />
              {t('detected')}
            </span>
          ) : undefined
        }
      >
        {t('label')}
      </FieldLabel>
      <div role="radiogroup" aria-label={t('country')} className="flex flex-wrap gap-1.5">
        {w.countries.map((c) => (
          <button
            key={c.code}
            type="button"
            role="radio"
            aria-checked={w.values.country === c.code}
            onClick={() => {
              w.setValue('country', c.code)
              w.setValue('regionId', '')
            }}
            className={cn(
              'inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition-colors sm:min-h-9',
              w.values.country === c.code ? 'border-brand-600 bg-brand-500/10' : 'hover:border-muted-foreground',
            )}
          >
            <span aria-hidden>{c.flag}</span>
            {placeName(c.name, w.locale)}
          </button>
        ))}
      </div>
      <label htmlFor="wz-region" className="sr-only">
        {t('region')}
      </label>
      <select
        id="wz-region"
        className={input}
        disabled={!w.values.country}
        value={w.values.regionId}
        onChange={(e) => {
          if (e.target.value === '__new') {
            setCreating(true)
            return
          }
          w.setValue('regionId', e.target.value)
        }}
      >
        <option value="">{w.values.country ? t('regionPlaceholder') : t('countryFirst')}</option>
        {regions.map((r) => (
          <option key={r.id} value={r.id}>
            {placeName(r.name, w.locale)}
          </option>
        ))}
        {w.staff && w.values.country && <option value="__new">＋ {t('newRegion')}</option>}
      </select>

      {w.staff && creating && (
        <div className="grid gap-2 rounded-xl border border-dashed border-brand-600 bg-brand-500/5 p-3 animate-in fade-in duration-200">
          <input className={input} placeholder={t('newRegionName')} aria-label={t('newRegionName')} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
          <input className={input} placeholder={t('newRegionNameEn')} aria-label={t('newRegionNameEn')} value={nameEn} onChange={(e) => setNameEn(e.target.value)} maxLength={60} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving || name.trim().length < 2}
              onClick={create}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
              {t('create')}
            </button>
            <button type="button" onClick={() => setCreating(false)} className="min-h-10 rounded-lg px-3 text-sm font-semibold text-muted-foreground hover:bg-muted">
              {t('cancel')}
            </button>
          </div>
          <span className="text-xs text-muted-foreground">{t('staffOnly')}</span>
          {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
      )}
      {!w.staff && <span className="text-xs text-muted-foreground">{t('authorHint')}</span>}
    </WizardCard>
  )
}

/* ------------------------------------------------------------------ step 3 */

export function StopsPhotosStep({ w }: { w: WizardModel }) {
  const t = useTranslations('submitWizard.stops')
  const tTypes = useTranslations('stopTypes')
  const [open, setOpen] = useState<string | null>(null)
  const [placing, setPlacing] = useState(false)

  const update = (key: string, patch: Partial<WizardModel['stops'][number]>) =>
    w.setStops((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)))

  const addAt = (p: { lat: number; lng: number }) => {
    const key = crypto.randomUUID()
    w.setStops((prev) => [...prev, { key, name: '', description: '', type: 'viewpoint', ...p }])
    setOpen(key)
    setPlacing(false)
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-4">
        <h2 className={sectionTitle}>{t('heading')}</h2>

        <WizardCard className="flex flex-col gap-3">
          <FieldLabel badge={w.source === 'gpx' && w.stops.length ? <AutoBadge state="auto" label={t('fromGpx')} /> : undefined}>
            {t('label', { count: w.stops.length })}
          </FieldLabel>
          {w.stops.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('empty')}</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {w.stops.map((s, i) => (
                <li
                  key={s.key}
                  className={cn(
                    'grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border bg-background p-2.5 animate-in fade-in duration-200',
                    open === s.key && 'border-brand-600',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-7 w-7 place-items-center rounded-full text-xs font-bold text-white',
                      s.offRouteKm > 2 ? 'bg-amber-600' : 'bg-brand-600',
                    )}
                  >
                    {i + 1}
                  </span>
                  {open === s.key ? (
                    <div className="flex min-w-0 flex-col gap-2">
                      <input
                        autoFocus
                        className={input}
                        aria-label={t('name')}
                        placeholder={t('name')}
                        value={s.name}
                        maxLength={120}
                        onChange={(e) => update(s.key, { name: e.target.value })}
                      />
                      <select className={input} aria-label={t('type')} value={s.type} onChange={(e) => update(s.key, { type: e.target.value as StopType })}>
                        {STOP_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {tTypes(type)}
                          </option>
                        ))}
                      </select>
                      <input
                        className={input}
                        aria-label={t('notes')}
                        placeholder={t('notes')}
                        value={s.description}
                        onChange={(e) => update(s.key, { description: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setOpen(null)}
                        className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg border px-3 text-sm font-semibold hover:bg-muted"
                      >
                        <Check className="h-4 w-4" aria-hidden />
                        {t('done')}
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setOpen(s.key)} className="flex min-w-0 flex-col gap-1 text-left" aria-label={t('edit', { name: s.name || t('untitled') })}>
                      <strong className="break-words text-[14.5px] leading-snug">{s.name || t('untitled')}</strong>
                      <span className="flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11.5px] font-semibold text-muted-foreground">{tTypes(s.type)}</span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11.5px] font-semibold tabular-nums text-muted-foreground">km {s.km}</span>
                        {s.offRouteKm > 2 && (
                          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11.5px] font-semibold text-amber-600 dark:text-amber-400">
                            {t('offRoute', { km: s.offRouteKm })}
                          </span>
                        )}
                        {w.via?.key === s.key && (
                          <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-[11.5px] font-semibold text-brand-700 dark:text-brand-300">{t('inTitle')}</span>
                        )}
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => w.setStops((prev) => prev.filter((x) => x.key !== s.key))}
                    aria-label={t('remove', { name: s.name || t('untitled') })}
                    className="grid h-11 w-11 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ol>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPlacing((p) => !p)}
              aria-pressed={placing}
              className={cn(
                'inline-flex min-h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold transition-colors',
                placing ? 'border-sky-600 bg-sky-600 text-white' : 'hover:bg-muted',
              )}
            >
              {placing ? <X className="h-4 w-4" aria-hidden /> : <Crosshair className="h-4 w-4" aria-hidden />}
              {placing ? t('cancelPlacing') : t('add')}
            </button>
            <span className="text-xs text-muted-foreground">{placing ? t('clickMap') : t('sorted')}</span>
          </div>
        </WizardCard>

        <PhotosCard w={w} />
      </div>

      {/* Map first on phones, so stops can be placed without scrolling */}
      <div className="order-first min-w-0 lg:order-none lg:sticky lg:top-20">
        <div className="relative">
          <TrackMap w={w} className={cn('h-[260px] sm:h-[420px]', placing && 'ring-2 ring-sky-500')} onMapClick={placing ? addAt : undefined} />
          {placing && (
            <span className="pointer-events-none absolute left-1/2 top-3 z-[500] -translate-x-1/2 rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold text-white shadow">
              {t('clickMap')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function PhotosCard({ w }: { w: WizardModel }) {
  const t = useTranslations('submitWizard.photos')
  const [rejected, setRejected] = useState(0)

  const add = (files: FileList | null) => {
    if (!files) return
    const list = Array.from(files)
    const ok = list.filter((f) => ACCEPTED_PHOTO_TYPES.includes(f.type))
    setRejected(list.length - ok.length)
    w.setPhotos((prev) => [...prev, ...ok.map((file) => ({ key: crypto.randomUUID(), file, url: URL.createObjectURL(file) }))])
  }

  return (
    <WizardCard className="flex flex-col gap-3">
      <FieldLabel badge={<span className="text-xs text-muted-foreground">{t('formats')}</span>}>{t('label', { count: w.photos.length })}</FieldLabel>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))]">
        {w.photos.map((p, i) => (
          <div key={p.key} className="relative aspect-[4/3] max-w-full overflow-hidden rounded-xl border bg-muted animate-in fade-in zoom-in-95 duration-200">
            {/* eslint-disable-next-line @next/next/no-img-element -- local preview (blob URL) */}
            <img src={p.url} alt={p.file.name} className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                <Star className="h-3 w-3" aria-hidden />
                {t('cover')}
              </span>
            )}
            <div className="absolute bottom-1.5 right-1.5 flex gap-1">
              {i > 0 && (
                <button
                  type="button"
                  title={t('makeCover')}
                  aria-label={t('makeCover')}
                  onClick={() => w.setPhotos((prev) => [prev[i], ...prev.filter((_, j) => j !== i)])}
                  className="grid h-9 w-9 place-items-center rounded-lg bg-black/70 text-white"
                >
                  <Star className="h-4 w-4" aria-hidden />
                </button>
              )}
              <button
                type="button"
                title={t('remove')}
                aria-label={t('remove')}
                onClick={() => {
                  URL.revokeObjectURL(p.url)
                  w.setPhotos((prev) => prev.filter((x) => x.key !== p.key))
                }}
                className="grid h-9 w-9 place-items-center rounded-lg bg-black/70 text-white"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        ))}
        <label className="relative grid aspect-[4/3] max-w-full cursor-pointer place-items-center rounded-xl border-2 border-dashed p-2 text-center text-sm font-semibold text-muted-foreground transition-colors hover:border-brand-600 hover:text-foreground">
          <span className="flex flex-col items-center gap-1.5">
            <ImagePlus className="h-5 w-5" aria-hidden />
            {t('add')}
          </span>
          <input
            type="file"
            multiple
            accept={ACCEPTED_PHOTO_TYPES.join(',')}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label={t('add')}
            onChange={(e) => {
              add(e.target.files)
              e.target.value = ''
            }}
          />
        </label>
      </div>
      {rejected > 0 && <p className="text-xs text-destructive">{t('rejected', { count: rejected })}</p>}
      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        {w.staff ? t('whoStaff') : t('whoAuthor')}
      </p>
    </WizardCard>
  )
}

/* ------------------------------------------------------------------ step 4 */

export function ReviewStep({ w }: { w: WizardModel }) {
  const t = useTranslations('submitWizard.review')
  const tSubmit = useTranslations('submit')
  const country = w.countries.find((c) => c.code === w.values.country)
  const path = routeSvgPath(w.points, 600, 338, 24)
  const via = w.places
  const cover = w.photos[0]
  const tDiff = useTranslations('difficulty')
  const diffLabel = tDiff(w.values.difficulty)

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-4">
        <h2 className={sectionTitle}>{t('heading')}</h2>
        <WizardCard>
          <ul className="flex flex-col gap-2">
            {w.checks.map((c) => (
              <li key={c.key} className="flex items-center gap-3 text-sm">
                <span
                  className={cn(
                    'grid h-6 w-6 shrink-0 place-items-center rounded-full',
                    c.ok ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {c.ok ? <Check className="h-3.5 w-3.5" aria-hidden /> : '·'}
                </span>
                <span className="flex-1">
                  {t(`checks.${c.key}`)}
                  {c.optional && <span className="text-muted-foreground"> · {t('recommended')}</span>}
                </span>
                <button type="button" onClick={() => w.go(c.step)} className="min-h-9 rounded-lg px-3 text-sm font-semibold hover:bg-muted">
                  {t('edit')}
                </button>
              </li>
            ))}
          </ul>
        </WizardCard>

        <WizardCard className="flex flex-col gap-4">
          <ol className="relative grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground before:absolute before:left-[16%] before:right-[16%] before:top-[15px] before:h-0.5 before:bg-border">
            {(['you', 'curator', 'published'] as const).map((key, i) => (
              <li key={key} className="relative flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    'grid h-[30px] w-[30px] place-items-center rounded-full border-2 bg-card',
                    i === 0 ? 'border-brand-600 text-brand-600' : 'border-border',
                  )}
                >
                  {i + 1}
                </span>
                <strong className="text-[12.5px] text-foreground">{t(`flow.${key}`)}</strong>
                <span>{t(`flow.${key}Hint`)}</span>
              </li>
            ))}
          </ol>
          <p className="flex items-start gap-2.5 rounded-xl bg-sky-500/10 p-3 text-sm text-foreground/85">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden />
            {t.rich('reviewNote', { b: (chunks) => <b>{chunks}</b> })}
          </p>
        </WizardCard>
      </div>

      {/* Preview first on phones */}
      <div className="order-first flex min-w-0 flex-col gap-2 lg:order-none">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{t('preview')}</span>
        <article className="overflow-hidden rounded-2xl border bg-card">
          <div className="relative aspect-video max-w-full bg-muted">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element -- local preview (blob URL)
              <img src={cover.url} alt="" className="h-full w-full object-cover" />
            ) : (
              path && (
                <svg viewBox="0 0 600 338" className="h-full w-full" aria-hidden>
                  <path d={path} fill="none" stroke="#e11d2e" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" className="road-draw" pathLength={1} />
                </svg>
              )
            )}
            <span className="absolute left-2.5 top-2.5 rounded-full bg-black/75 px-2.5 py-1 text-[11.5px] font-semibold text-amber-300">
              {t('pendingBadge')}
            </span>
          </div>
          <div className="flex flex-col gap-2.5 p-4">
            <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
              <span>
                {country?.flag} {w.region ? placeName(w.region.name, w.locale) : ''}
              </span>
              <span>{diffLabel}</span>
            </div>
            <h3 className="font-display text-3xl font-extrabold uppercase leading-[0.95]">{w.values.name}</h3>
            {via.length > 0 && <p className="text-sm text-foreground/80">{via.join(' › ')}</p>}
            <div className="grid grid-cols-3 gap-2 border-y py-2.5">
              {[
                [`${w.values.distanceKm} km`, tSubmit('distanceLabel')],
                [formatDuration(w.values.durationMin), tSubmit('durationLabel')],
                [String(w.stops.length), t('stopsLabel')],
              ].map(([v, l]) => (
                <div key={l} className="min-w-0">
                  <div className="font-display text-[22px] font-extrabold leading-none">{v}</div>
                  <div className="mt-1 truncate text-[11.5px] text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
            <p className="break-all font-mono text-[11px] text-muted-foreground">{w.title}</p>
          </div>
        </article>
      </div>
    </div>
  )
}
