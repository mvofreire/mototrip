import { scoreTone } from '@/lib/blog/seo'
import { cn } from '@/lib/utils'

const COLORS = { good: '#16a34a', warn: '#d97706', bad: '#dc2626' } as const

/** SEO score (0-100) as a ring with the number inside */
export function SeoScore({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' }) {
  const color = COLORS[scoreTone(score)]
  return (
    <span
      role="img"
      aria-label={`SEO ${score}/100`}
      className={cn('inline-grid shrink-0 place-items-center rounded-full', size === 'sm' ? 'h-8 w-8' : 'h-11 w-11')}
      style={{ background: `conic-gradient(${color} ${score}%, hsl(var(--muted)) 0)` }}
    >
      <span
        className={cn(
          'grid place-items-center rounded-full bg-card font-semibold tabular-nums',
          size === 'sm' ? 'h-6 w-6 text-[10px]' : 'h-[34px] w-[34px] text-xs',
        )}
      >
        {score}
      </span>
    </span>
  )
}
