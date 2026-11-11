import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { AlertTriangle, CalendarDays, ChevronDown, ExternalLink, MapPin, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { localizeCuratorReview } from '@/lib/localize'
import { formatRating } from '@/lib/utils'
import type { RouteCuratorReview as Review } from '@/types'

/** The MotoTrip brand mark, as in the header */
function MotoTripMark() {
  return (
    <div className="h-10 w-10 shrink-0 rounded-lg bg-gradient-brand flex items-center justify-center">
      <MapPin className="h-6 w-6 text-white" />
    </div>
  )
}

/**
 * "Avaliação MotoTrip": the curation team's review (1–5), based on research
 * and shown with its sources. Separate from the community reviews.
 */
export function RouteCuratorReview({ review: original }: { review: Review | null | undefined }) {
  const t = useTranslations()
  const tc = useTranslations('curator')
  const locale = useLocale()
  if (!original) return null
  const review = localizeCuratorReview(original, locale)

  const scores = [
    { label: t('ratings.scenic'), value: Number(review.scenic) },
    { label: t('ratings.roadQuality'), value: Number(review.road) },
    { label: t('ratings.funFactor'), value: Number(review.fun) },
  ]
  const sources = Array.isArray(review.sources) ? review.sources : []
  const researched = review.researched_at
    ? new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(review.researched_at))
    : null

  return (
    <Card className="overflow-hidden" aria-labelledby="curator-review-title">
      <CardContent className="p-4 md:p-6 space-y-5">
        {/* Header: brand + overall score */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <MotoTripMark />
            <div className="min-w-0">
              <h2 id="curator-review-title" className="font-semibold text-lg leading-tight">
                {t('ratings.editorialTitle')}
              </h2>
              <p className="text-xs text-muted-foreground">
                {review.curator_id ? (
                  <Link href={`/${locale}/riders/${review.curator_id}`} className="hover:underline">
                    {tc('byCuration')}
                  </Link>
                ) : (
                  tc('byCuration')
                )}
                {researched && <> · {tc('researchedAt', { date: researched })}</>}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-bold leading-none tabular-nums">
              {formatRating(Number(review.overall))}
              <span className="text-base font-medium text-muted-foreground">/5</span>
            </div>
            {review.confidence === 'low' && (
              <p className="mt-1 text-xs text-muted-foreground">{tc('lowConfidence')}</p>
            )}
          </div>
        </div>

        {/* Sub-scores */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          {scores.map((s) => (
            <div key={s.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm gap-2">
                <span className="text-muted-foreground truncate">{s.label}</span>
                <span className="font-semibold shrink-0 tabular-nums">{formatRating(s.value)}</span>
              </div>
              <div
                className="h-2 bg-muted rounded-full overflow-hidden"
                role="meter"
                aria-label={s.label}
                aria-valuemin={1}
                aria-valuemax={5}
                aria-valuenow={s.value}
              >
                <div className="h-full bg-gradient-brand" style={{ width: `${(s.value / 5) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        <p className="leading-relaxed break-words">{review.verdict}</p>

        {(review.highlights.length > 0 || review.warnings.length > 0) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {review.highlights.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-brand-500" />
                  {tc('highlights')}
                </h3>
                <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                  {review.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
            {review.warnings.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  {tc('warnings')}
                </h3>
                <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                  {review.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {review.best_season && (
          <p className="text-sm flex items-start gap-1.5">
            <CalendarDays className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            <span>
              <span className="font-semibold">{tc('bestSeason')}:</span> {review.best_season}
            </span>
          </p>
        )}

        {sources.length > 0 && (
          <details className="group border-t pt-4">
            <summary className="flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
              {tc('basedOn', { count: sources.length })}
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>
            <ul className="mt-3 space-y-2 text-sm">
              {sources.map((s) => (
                <li key={s.url} className="min-w-0">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-start gap-1.5 text-primary hover:underline break-words"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>
                      {s.title}
                      {s.site && <span className="text-muted-foreground"> · {s.site}</span>}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}
      </CardContent>
    </Card>
  )
}
