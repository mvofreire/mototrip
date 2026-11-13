'use client'

import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Search, SlidersHorizontal, LayoutGrid, List, Map as MapIcon, X, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RouteCard } from '@/components/features/routes/route-card'
import {
  RouteFilters, FilterChip, toggleValue, useFilterSections,
} from '@/components/features/routes/route-filters'
import { RoutesOverviewMap } from '@/components/features/routes/routes-overview-map'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import {
  activeCount, countOptions, filterRoutes, filtersFromParams, filtersToParams, isSortKey, sortRoutes,
  SORTS, type ExploreFilters, type SortKey,
} from '@/lib/route-filtering'
import { cn } from '@/lib/utils'
import type { RouteWithDetails } from '@/types'

type ViewMode = 'grid' | 'list' | 'map'

/**
 * Interactive explore listing. Every published route comes from the server
 * (`initialRoutes`), so filters, search and sort all run in the browser: the
 * list updates instantly and the URL is kept in sync without a navigation.
 */
export function ExploreView({ locale, initialRoutes }: { locale: string; initialRoutes: any[] }) {
  const t = useTranslations('explore')
  const tf = useTranslations('filters')
  const searchParams = useSearchParams()
  const routes = initialRoutes as RouteWithDetails[]
  const sections = useFilterSections(locale)

  const [filters, setFilters] = useState<ExploreFilters>(() => filtersFromParams(searchParams))
  const [sort, setSort] = useState<SortKey>(() => {
    const v = searchParams.get('sort')
    return isSortKey(v) ? v : 'recent'
  })
  const [sheetOpen, setSheetOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Keep the URL shareable. replaceState updates it without a Next navigation,
  // so nothing reloads while the user taps filters.
  useEffect(() => {
    const qs = filtersToParams(filters, sort).toString()
    const url = `${window.location.pathname}${qs ? `?${qs}` : ''}`
    if (url !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(window.history.state, '', url)
    }
  }, [filters, sort])

  const deferredFilters = useDeferredValue(filters)
  const results = useMemo(
    () => sortRoutes(filterRoutes(routes, deferredFilters, locale), sort),
    [routes, deferredFilters, locale, sort],
  )

  const active = activeCount(filters)
  const clearAll = () => setFilters({})

  // Category chips double as quick filters above the list on mobile
  const categorySection = sections.find((s) => s.group === 'category')!
  const categoryCounts = countOptions(routes, filters, locale, 'category', categorySection.options.map((o) => o.value))

  // Pills for what is on right now, each removable on its own
  const pills: { key: string; text: string; label: React.ReactNode; remove: () => void }[] = []
  for (const section of sections) {
    for (const value of filters[section.group] ?? []) {
      const option = section.options.find((o) => o.value === value)
      if (!option) continue
      pills.push({
        key: `${section.group}:${value}`,
        text: option.hint ? `${option.label} ${option.hint}` : option.label,
        label: (
          <>
            {option.prefix}
            {option.label}
            {option.hint && <span className="text-muted-foreground">· {option.hint}</span>}
          </>
        ),
        remove: () => setFilters((f) => toggleValue(f, section.group, value)),
      })
    }
  }
  if (filters.rating) {
    pills.push({
      key: 'rating',
      text: `MotoTrip ${filters.rating}+`,
      label: (
        <>
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          MotoTrip {filters.rating}+
        </>
      ),
      remove: () => setFilters((f) => ({ ...f, rating: undefined })),
    })
  }

  const panel = (
    <RouteFilters
      routes={routes}
      filters={filters}
      onFiltersChange={setFilters}
      locale={locale}
      sections={sections}
    />
  )

  return (
    <div className="container py-6 md:py-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t('title')}</h1>
        <p className="text-muted-foreground md:text-lg">{t('subtitle', { count: routes.length })}</p>
      </div>

      {/* Search + filters toolbar (sticky under the site header on mobile) */}
      <div className="sticky top-[calc(4rem+env(safe-area-inset-top))] z-30 -mx-8 mt-5 border-b bg-background/95 px-8 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              placeholder={t('searchPlaceholder')}
              className="h-11 rounded-full pl-9 pr-9"
              value={filters.search ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
            />
            {filters.search && (
              <button
                type="button"
                aria-label={tf('clearSearch')}
                onClick={() => setFilters((f) => ({ ...f, search: undefined }))}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            variant={active ? 'default' : 'outline'}
            className="h-11 shrink-0 rounded-full px-4 lg:hidden"
            onClick={() => setSheetOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4 sm:mr-2" />
            <span className="sr-only sm:not-sr-only">{t('filters')}</span>
            {active > 0 && (
              <span className="ml-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-foreground px-1.5 text-xs font-semibold text-primary">
                {active}
              </span>
            )}
          </Button>
        </div>

        {/* Quick category chips — mobile/tablet */}
        <div className="-mx-8 mt-3 flex gap-2 overflow-x-auto px-8 pb-0.5 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
          {categorySection.options.map((o) => {
            const isOn = !!filters.category?.includes(o.value)
            return (
              <FilterChip
                key={o.value}
                selected={isOn}
                disabled={!isOn && categoryCounts[o.value] === 0}
                onClick={() => setFilters((f) => toggleValue(f, 'category', o.value))}
              >
                {o.icon && <o.icon className="h-4 w-4" />}
                {o.label}
              </FilterChip>
            )
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border bg-card p-5 [scrollbar-width:thin]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <SlidersHorizontal className="h-4 w-4" />
                {tf('title')}
              </h2>
              {active > 0 && (
                <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={clearAll}>
                  {tf('clearAll')}
                </Button>
              )}
            </div>
            {panel}
          </div>
        </aside>

        {/* Results */}
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium" aria-live="polite">
              {t('results', { count: results.length })}
            </p>
            <div className="flex items-center gap-2">
              <Select value={sort} onValueChange={(v) => isSortKey(v) && setSort(v)}>
                <SelectTrigger className="h-10 w-[170px] sm:w-[230px]" aria-label={t('sort.label')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORTS.map((s) => (
                    <SelectItem key={s} value={s}>{t(`sort.${s}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1 rounded-lg border p-1">
                {([
                  ['grid', LayoutGrid, t('view.grid')],
                  ['list', List, t('view.list')],
                  ['map', MapIcon, t('view.map')],
                ] as const).map(([mode, Icon, label]) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    className="h-8 w-8 p-0"
                    title={label}
                    aria-label={label}
                    aria-pressed={viewMode === mode}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Active filters */}
          {pills.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {pills.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={p.remove}
                  aria-label={`${tf('remove')}: ${p.text}`}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium hover:bg-muted/70"
                >
                  {p.label}
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ))}
              <button
                type="button"
                onClick={clearAll}
                className="min-h-8 px-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                {tf('clearAll')}
              </button>
            </div>
          )}

          <div className={cn('transition-opacity', deferredFilters !== filters && 'opacity-60')}>
            {results.length > 0 ? (
              viewMode === 'map' ? (
                <div className="space-y-6">
                  <RoutesOverviewMap routes={results} locale={locale} />
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {results.map((route) => (
                      <RouteCard key={route.id} route={route} locale={locale} />
                    ))}
                  </div>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {results.map((route) => (
                    <RouteCard key={route.id} route={route} locale={locale} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {results.map((route) => (
                    <RouteCard key={route.id} route={route} locale={locale} variant="list" />
                  ))}
                </div>
              )
            ) : (
              <div className="rounded-2xl border border-dashed px-6 py-14 text-center">
                <p className="font-medium">{t('noResults')}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('noResultsHint')}</p>
                <Button variant="outline" className="mt-4 rounded-full" onClick={clearAll}>
                  {t('clearFilters')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile/tablet filters: bottom sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="flex h-[88dvh] flex-col gap-0 rounded-t-3xl p-0 lg:hidden [&>button:last-child]:hidden"
        >
          <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/30" aria-hidden />
          <div className="flex shrink-0 items-center justify-between border-b px-5 pb-3 pt-2">
            <div>
              <SheetTitle>{tf('title')}</SheetTitle>
              <SheetDescription className="text-xs">{tf('sheetHint')}</SheetDescription>
            </div>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              aria-label={tf('close')}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">{panel}</div>
          <div className="flex shrink-0 gap-3 border-t bg-background px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Button variant="ghost" className="h-12 rounded-full px-5" onClick={clearAll} disabled={!active}>
              {tf('clearAll')}
            </Button>
            <Button className="h-12 flex-1 rounded-full text-base" onClick={() => setSheetOpen(false)}>
              {tf('showResults', { count: filterRoutes(routes, filters, locale).length })}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
