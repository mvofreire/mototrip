'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { RouteCard } from '@/components/features/routes/route-card'
import { cn } from '@/lib/utils'
import type { RouteCardData } from '@/lib/routes/card'

const SORTS = ['featured', 'shortest', 'longest', 'rating'] as const
type Sort = (typeof SORTS)[number]
const DIFFICULTIES = ['easy', 'moderate', 'challenging', 'expert'] as const

const chip = (active: boolean) =>
  cn(
    'inline-flex min-h-[36px] shrink-0 items-center rounded-full border px-3.5 text-sm font-medium transition-all duration-200',
    active ? 'border-primary bg-[hsl(var(--primary)/0.12)] text-primary' : 'text-muted-foreground hover:border-[hsl(var(--primary)/0.6)] hover:text-foreground',
  )

/** Route grid of a destination page with sort and difficulty chips */
export function RegionRoutes({ routes, locale }: { routes: RouteCardData[]; locale: string }) {
  const t = useTranslations('regions')
  const tAll = useTranslations()
  const [sort, setSort] = useState<Sort>('featured')
  const [difficulty, setDifficulty] = useState<string | null>(null)

  const available = DIFFICULTIES.filter((d) => routes.some((r) => r.difficulty === d))
  const shown = useMemo(() => {
    const list = difficulty ? routes.filter((r) => r.difficulty === difficulty) : [...routes]
    const km = (r: RouteCardData) => Number(r.distance_km || 0)
    const rating = (r: RouteCardData) => Number(r.curator_rating ?? r.rating_average ?? 0)
    if (sort === 'shortest') list.sort((a, b) => km(a) - km(b))
    else if (sort === 'longest') list.sort((a, b) => km(b) - km(a))
    else if (sort === 'rating') list.sort((a, b) => rating(b) - rating(a))
    return list
  }, [routes, sort, difficulty])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('sortLabel')}>
          <span className="mr-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{t('sortLabel')}</span>
          {SORTS.map((s) => (
            <button key={s} type="button" aria-pressed={sort === s} onClick={() => setSort(s)} className={chip(sort === s)}>
              {t(`sort.${s}`)}
            </button>
          ))}
        </div>
        {available.length > 1 && (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('difficultyLabel')}>
            <span className="mr-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{t('difficultyLabel')}</span>
            <button type="button" aria-pressed={!difficulty} onClick={() => setDifficulty(null)} className={chip(!difficulty)}>
              {t('all')}
            </button>
            {available.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={difficulty === d}
                onClick={() => setDifficulty(difficulty === d ? null : d)}
                className={chip(difficulty === d)}
              >
                {tAll(`difficulty.${d}`)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div key={`${sort}-${difficulty}`} className="dest-swap grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((route, i) => (
          <div key={route.id} style={{ '--i': Math.min(i, 8) } as React.CSSProperties}>
            <RouteCard route={route} locale={locale} />
          </div>
        ))}
      </div>
    </div>
  )
}
