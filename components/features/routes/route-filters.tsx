'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import {
  Mountain, Waves, Camera, CalendarDays, Compass, RefreshCw, ArrowLeftRight, Eye, Coffee,
  UtensilsCrossed, Landmark, Fuel, BedDouble, Star, Sparkles, Spline, Route as RouteIcon,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { COUNTRIES, countryName } from '@/lib/countries'
import { REGIONS, textFor } from '@/lib/regions'
import {
  countOptions, countRatings, DISTANCE_BUCKETS, DURATION_BUCKETS, ELEVATION_BUCKETS, HIGHLIGHTS,
  RATING_STEPS, STOP_TYPES, type ExploreFilters, type FilterGroup,
} from '@/lib/route-filtering'
import type { RouteWithDetails } from '@/types'

export interface FilterOption {
  value: string
  label: string
  hint?: string
  icon?: LucideIcon
  /** Emoji flag or colour dot shown before the label */
  prefix?: React.ReactNode
}

export interface FilterSection {
  group: FilterGroup
  title: string
  help?: string
  options: FilterOption[]
}

const DIFFICULTY_DOT: Record<string, string> = {
  easy: 'bg-emerald-500',
  moderate: 'bg-amber-500',
  challenging: 'bg-orange-600',
  expert: 'bg-red-600',
}

const rangeHint = (r: { min?: number; max?: number }, unit: string, scale = 1) => {
  const f = (n: number) => `${n / scale}`
  if (r.min == null && r.max != null) return `< ${f(r.max)} ${unit}`
  if (r.max == null && r.min != null) return `${f(r.min)}+ ${unit}`
  return `${f(r.min!)}–${f(r.max!)} ${unit}`
}

/** Every filter group with translated options, shared by the panel and the active pills */
export function useFilterSections(locale: string): FilterSection[] {
  const t = useTranslations('filters')
  const tCat = useTranslations('categories')
  const tDiff = useTranslations('difficulty')
  const tStop = useTranslations('stopTypes')

  return useMemo(() => [
    {
      group: 'category',
      title: t('groups.style'),
      options: [
        { value: 'mountain', label: tCat('mountain'), icon: Mountain },
        { value: 'coastal', label: tCat('coastal'), icon: Waves },
        { value: 'scenic', label: tCat('scenic'), icon: Camera },
        { value: 'weekend', label: tCat('weekend'), icon: CalendarDays },
        { value: 'adventure', label: tCat('adventure'), icon: Compass },
      ],
    },
    {
      group: 'country',
      title: t('groups.country'),
      options: COUNTRIES.map((c) => ({ value: c.code, label: countryName(c, locale), prefix: c.flag })),
    },
    {
      group: 'region',
      title: t('groups.region'),
      options: REGIONS.filter((r) => r.kind === 'region').map((r) => ({
        value: r.slug,
        label: textFor(r.name, locale),
        prefix: COUNTRIES.find((c) => c.code === r.country)?.flag,
      })),
    },
    {
      group: 'dist',
      title: t('groups.distance'),
      help: t('help.distance'),
      options: Object.entries(DISTANCE_BUCKETS).map(([v, r]) => ({
        value: v, label: t(`dist.${v}`), hint: rangeHint(r, 'km'),
      })),
    },
    {
      group: 'time',
      title: t('groups.time'),
      help: t('help.time'),
      options: Object.entries(DURATION_BUCKETS).map(([v, r]) => ({
        value: v, label: t(`time.${v}`), hint: rangeHint(r, 'h', 60),
      })),
    },
    {
      group: 'difficulty',
      title: t('groups.difficulty'),
      options: ['easy', 'moderate', 'challenging', 'expert'].map((v) => ({
        value: v,
        label: tDiff(v),
        prefix: <span className={cn('h-2 w-2 rounded-full', DIFFICULTY_DOT[v])} />,
      })),
    },
    {
      group: 'elev',
      title: t('groups.terrain'),
      help: t('help.terrain'),
      options: Object.entries(ELEVATION_BUCKETS).map(([v, r]) => ({
        value: v, label: t(`elev.${v}`), hint: rangeHint(r, 'm'),
      })),
    },
    {
      group: 'type',
      title: t('groups.format'),
      options: [
        { value: 'loop', label: t('routeTypeLoop'), icon: RefreshCw },
        { value: 'out_and_back', label: t('routeTypeOutAndBack'), icon: ArrowLeftRight },
      ],
    },
    {
      group: 'stop',
      title: t('groups.stops'),
      help: t('help.stops'),
      options: STOP_TYPES.map((v) => ({
        value: v,
        label: tStop(v),
        icon: { viewpoint: Eye, cafe: Coffee, restaurant: UtensilsCrossed, landmark: Landmark, gas_station: Fuel, accommodation: BedDouble }[v],
      })),
    },
    {
      group: 'feat',
      title: t('groups.highlights'),
      help: t('help.highlights'),
      options: Object.keys(HIGHLIGHTS).map((v) => ({
        value: v,
        label: t(`feat.${v}`),
        icon: { featured: Sparkles, views: Camera, curves: Spline, asphalt: RouteIcon }[v],
      })),
    },
  ] satisfies FilterSection[], [t, tCat, tDiff, tStop, locale])
}

/* ---------- Chip ---------- */

export function FilterChip({
  selected, disabled, onClick, children, count, className,
}: {
  selected: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
  count?: number
  className?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        selected
          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
          : 'border-border bg-background hover:border-foreground/30 hover:bg-muted',
        disabled && 'cursor-not-allowed opacity-40 hover:border-border hover:bg-background',
        className,
      )}
    >
      {children}
      {count != null && (
        <span className={cn('text-xs tabular-nums', selected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
          {count}
        </span>
      )}
    </button>
  )
}

/* ---------- Panel ---------- */

interface RouteFiltersProps {
  routes: RouteWithDetails[]
  filters: ExploreFilters
  onFiltersChange: (filters: ExploreFilters) => void
  locale: string
  sections: FilterSection[]
}

export function toggleValue(filters: ExploreFilters, group: FilterGroup, value: string): ExploreFilters {
  const current = filters[group] ?? []
  const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
  const updated: ExploreFilters = { ...filters, [group]: next.length ? next : undefined }
  // Regions that no longer fit the chosen countries are dropped
  if (group === 'country' && updated.region?.length && next.length) {
    const keep = updated.region.filter((slug) => {
      const region = REGIONS.find((r) => r.slug === slug)
      return region && next.includes(region.country)
    })
    updated.region = keep.length ? keep : undefined
  }
  return updated
}

export function RouteFilters({ routes, filters, onFiltersChange, locale, sections }: RouteFiltersProps) {
  const t = useTranslations('filters')
  const ratingCounts = useMemo(() => countRatings(routes, filters, locale), [routes, filters, locale])

  const sectionEls = sections.map((section) => {
    const counts = countOptions(routes, filters, locale, section.group, section.options.map((o) => o.value))
    const selected = filters[section.group] ?? []
    // Options no published route has (e.g. a stop type nobody uses yet) stay out
    const totals = countOptions(routes, {}, locale, section.group, section.options.map((o) => o.value))
    let options = section.options.filter((o) => totals[o.value] > 0 || selected.includes(o.value))
    // Only regions that have routes (and fit the chosen countries) are worth showing
    if (section.group === 'region') {
      options = options.filter((o) => {
        if (selected.includes(o.value)) return true
        const region = REGIONS.find((r) => r.slug === o.value)
        if (filters.country?.length && region && !filters.country.includes(region.country)) return false
        return counts[o.value] > 0
      })
      if (!options.length) return null
    }

    return (
      <section key={section.group} className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">{section.title}</h3>
          {section.help && <p className="mt-0.5 text-xs text-muted-foreground">{section.help}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {options.map((o) => {
            const isOn = selected.includes(o.value)
            return (
              <FilterChip
                key={o.value}
                selected={isOn}
                disabled={!isOn && counts[o.value] === 0}
                count={counts[o.value]}
                onClick={() => onFiltersChange(toggleValue(filters, section.group, o.value))}
              >
                {o.prefix}
                {o.icon && <o.icon className="h-4 w-4" />}
                <span>{o.label}</span>
                {o.hint && (
                  <span className={cn('text-xs font-normal', isOn ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                    · {o.hint}
                  </span>
                )}
              </FilterChip>
            )
          })}
        </div>
      </section>
    )
  })

  // MotoTrip rating goes right after the riding basics (difficulty)
  const ratingIndex = sections.findIndex((s) => s.group === 'elev')
  const ratingEl = (
    <section key="rating" className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold">{t('groups.rating')}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{t('help.rating')}</p>
      </div>
      {/* "Any" is a word, the rest are short numbers: let the first column fit its text */}
      <div
        className="grid grid-cols-[minmax(max-content,1.3fr)_repeat(3,minmax(0,1fr))] gap-1 rounded-xl border bg-muted/40 p-1"
        role="radiogroup"
        aria-label={t('groups.rating')}
      >
        {[undefined, ...RATING_STEPS].map((step) => {
          const isOn = filters.rating === step
          const count = step ? ratingCounts[step] : undefined
          return (
            <button
              key={step ?? 'any'}
              type="button"
              role="radio"
              aria-checked={isOn}
              disabled={!!step && !isOn && count === 0}
              onClick={() => onFiltersChange({ ...filters, rating: step })}
              className={cn(
                'flex min-h-11 flex-col items-center justify-center whitespace-nowrap rounded-lg px-2 py-1 text-sm font-medium transition-colors disabled:opacity-40',
                isOn ? 'bg-background text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {step ? (
                <span className="inline-flex items-center gap-0.5">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {step}+
                </span>
              ) : (
                <span>{t('any')}</span>
              )}
              {count != null && <span className="text-[11px] font-normal tabular-nums text-muted-foreground">{count}</span>}
            </button>
          )
        })}
      </div>
    </section>
  )

  const all = [...sectionEls]
  all.splice(ratingIndex + 1, 0, ratingEl)

  return <div className="space-y-7">{all}</div>
}
