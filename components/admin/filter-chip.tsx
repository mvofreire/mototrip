'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Pill-shaped filter toggle with an optional count */
export function FilterChip({
  active,
  count,
  attention,
  size = 'md',
  onClick,
  children,
}: {
  active: boolean
  count?: number
  /** Highlights a filter that has work waiting (e.g. pending routes) */
  attention?: boolean
  size?: 'sm' | 'md'
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-medium transition-colors',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        active
          ? 'border-foreground bg-foreground text-background'
          : cn('bg-background text-muted-foreground hover:text-foreground', attention && 'border-amber-400 text-foreground'),
      )}
    >
      {children}
      {count != null && <span className="tabular-nums opacity-70">{count}</span>}
    </button>
  )
}
