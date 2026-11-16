'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useProfileStats } from '@/hooks/use-profile'
import { cn } from '@/lib/utils'

/** Tweens to a new value in 500ms (requestAnimationFrame, text only; off under reduced motion) */
function AnimatedNumber({ value, locale }: { value: number; locale: string }) {
  const [shown, setShown] = useState(0)
  const from = useRef(0)

  useEffect(() => {
    const start = from.current
    from.current = value
    if (start === value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(value)
      return
    }
    let frame = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 500)
      setShown(Math.round(start + (value - start) * (1 - Math.pow(1 - p, 3))))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])

  return <>{shown.toLocaleString(locale)}</>
}

export type StatTarget = 'routes' | 'saved'

/** Routes created, saved and rated. The first two open their tab. */
export function ProfileStats({ onSelect }: { onSelect: (tab: StatTarget) => void }) {
  const t = useTranslations('account')
  const locale = useLocale()
  const { created, saved, reviews } = useProfileStats()

  const items: { value: number | undefined; label: string; target?: StatTarget }[] = [
    { value: created, label: t('statsRoutesCreated'), target: 'routes' },
    { value: saved, label: t('statsRoutesSaved'), target: 'saved' },
    { value: reviews, label: t('statsReviews') },
  ]

  return (
    <section aria-label={t('statsTitle')} className="container">
      <div className="grid grid-cols-3 divide-x overflow-hidden rounded-xl border bg-card md:max-w-xl">
        {items.map(({ value, label, target }) => {
          const content = (
            <>
              {/* Fixed line box: the number arriving never moves the layout */}
              <span className="flex h-9 items-center font-display text-[34px] font-extrabold leading-none tabular-nums">
                {value === undefined ? (
                  <span className="h-7 w-8 animate-pulse rounded bg-muted" aria-hidden="true" />
                ) : (
                  <AnimatedNumber value={value} locale={locale} />
                )}
              </span>
              <span className="text-[11px] font-semibold uppercase leading-tight tracking-wide text-muted-foreground">
                {label}
              </span>
            </>
          )
          const cls = 'flex flex-col items-center gap-1 px-1.5 py-3 text-center'
          return target ? (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(target)}
              className={cn(cls, 'transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none')}
            >
              {content}
            </button>
          ) : (
            <div key={label} className={cls}>
              {content}
            </div>
          )
        })}
      </div>
    </section>
  )
}
