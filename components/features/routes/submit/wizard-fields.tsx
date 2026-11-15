'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { RotateCcw, Route as RouteIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/** "auto" when the value came from the track, "edited" (with undo) after a change */
export function AutoBadge({
  state,
  onReset,
  label,
}: {
  state: 'auto' | 'edited' | 'waiting'
  onReset?: () => void
  label?: string
}) {
  const t = useTranslations('submitWizard.fields')
  if (state === 'waiting') {
    return (
      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11.5px] font-semibold text-muted-foreground">
        {t('waiting')}
      </span>
    )
  }
  if (state === 'edited') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11.5px] font-semibold text-amber-600 dark:text-amber-400">
        {t('edited')}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            title={t('reset')}
            aria-label={t('reset')}
            className="-my-1 -mr-1 rounded-full p-1 hover:bg-amber-500/20"
          >
            <RotateCcw className="h-3 w-3" aria-hidden />
          </button>
        )}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[11.5px] font-semibold text-sky-700 dark:text-sky-300">
      <RouteIcon className="h-3 w-3" aria-hidden />
      {label ?? t('auto')}
    </span>
  )
}

/** Whole-number field with −/+ buttons and no upper limit (replaces the sliders) */
export function NumberField({
  id,
  value,
  onChange,
  step,
  unit,
  label,
  min = 0,
}: {
  id: string
  value: number
  onChange: (value: number) => void
  step: number
  unit: string
  label: string
  min?: number
}) {
  const t = useTranslations('submitWizard.fields')
  // Keep what's typed (e.g. an empty field) until it is a number again
  const [text, setText] = useState(String(value))
  useEffect(() => setText(String(value)), [value])

  const commit = (raw: string) => {
    const n = parseInt(raw.replace(/\D/g, ''), 10)
    if (!Number.isNaN(n)) onChange(Math.max(min, n))
  }

  return (
    <div className="flex min-h-11 items-stretch overflow-hidden rounded-lg border border-input bg-background focus-within:border-primary">
      <button
        type="button"
        className="w-11 shrink-0 text-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label={t('decrease', { label })}
        onClick={() => onChange(Math.max(min, value - step))}
      >
        −
      </button>
      <input
        id={id}
        inputMode="numeric"
        aria-label={label}
        className="min-w-0 flex-1 bg-transparent px-1 text-center font-semibold tabular-nums outline-none"
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          commit(e.target.value)
        }}
        onBlur={() => setText(String(value))}
      />
      <span className="grid place-items-center border-l border-border px-2.5 text-xs text-muted-foreground">
        {unit}
      </span>
      <button
        type="button"
        className="w-11 shrink-0 text-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label={t('increase', { label })}
        onClick={() => onChange(value + step)}
      >
        +
      </button>
    </div>
  )
}

/** Hours and minutes, typed separately */
export function DurationField({
  id,
  minutes,
  onChange,
}: {
  id: string
  minutes: number
  onChange: (minutes: number) => void
}) {
  const t = useTranslations('submitWizard.fields')
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const field = (key: 'h' | 'm', value: number) => (
    <div className="flex min-h-11 items-stretch overflow-hidden rounded-lg border border-input bg-background focus-within:border-primary">
      <input
        id={`${id}-${key}`}
        inputMode="numeric"
        aria-label={key === 'h' ? t('hours') : t('minutes')}
        className="min-w-0 flex-1 bg-transparent px-3 text-center font-semibold tabular-nums outline-none"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0
          onChange(key === 'h' ? n * 60 + m : h * 60 + Math.min(59, n))
        }}
      />
      <span className="grid place-items-center border-l border-border px-2.5 text-xs text-muted-foreground">
        {key === 'h' ? 'h' : 'min'}
      </span>
    </div>
  )
  return (
    <div className="grid grid-cols-2 gap-2">
      {field('h', h)}
      {field('m', m)}
    </div>
  )
}

/** One-tap choice; the value the track suggests carries a small dot */
export function ChoiceChips<T extends string>({
  options,
  value,
  suggested,
  onChange,
  label,
}: {
  options: { value: T; label: string }[]
  value: T | ''
  suggested?: T | null
  onChange: (value: T) => void
  label: string
}) {
  const t = useTranslations('submitWizard.fields')
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors sm:min-h-9',
            value === o.value
              ? 'border-foreground bg-foreground text-background'
              : 'border-border bg-card text-foreground/80 hover:border-muted-foreground',
          )}
        >
          {o.label}
          {suggested === o.value && (
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" title={t('suggested')} aria-label={t('suggested')} />
          )}
        </button>
      ))}
    </div>
  )
}

export function FieldLabel({ htmlFor, children, badge }: { htmlFor?: string; children: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-sm font-semibold">
          {children}
        </label>
      ) : (
        <span className="text-sm font-semibold">{children}</span>
      )}
      {badge}
    </div>
  )
}

export function WizardCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-2xl border bg-card p-4 sm:p-5', className)}>{children}</div>
}
