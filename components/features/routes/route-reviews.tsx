'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { CheckCircle2, Loader2, Pencil, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { isStaff } from '@/lib/auth/roles'
import { RatingsService, reviewScore, type RouteReview } from '@/lib/services/ratings.service'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { key: 'scenic', field: 'scenic_rating', label: 'ratings.scenic' },
  { key: 'road', field: 'road_quality_rating', label: 'ratings.roadQuality' },
  { key: 'fun', field: 'fun_factor_rating', label: 'ratings.funFactor' },
] as const

type Scores = { scenic: number; road: number; fun: number }

function Stars({ value, size = 'h-4 w-4' }: { value: number; size?: string }) {
  return (
    <span className="inline-flex" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(size, i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40')}
        />
      ))}
    </span>
  )
}

function StarInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm">{label}</span>
      <div className="flex" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${label}: ${i}/5`}
            onClick={() => onChange(i)}
            className="p-1"
          >
            <Star className={cn('h-6 w-6', i <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40')} />
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * "I rode this route": riders rate scenery, road and fun (1–5) and can leave
 * a comment. Shows the community average and the list of reviews.
 */
export function RouteReviews({ route }: { route: { id: string; user_id: string } }) {
  const t = useTranslations()
  const tr = useTranslations('reviews')
  const locale = useLocale()
  const { user } = useAuth()
  const pathname = usePathname()
  const [reviews, setReviews] = useState<RouteReview[] | null>(null)
  const [editing, setEditing] = useState(false)
  const [scores, setScores] = useState<Scores>({ scenic: 0, road: 0, fun: 0 })
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setReviews(await RatingsService.list(route.id))
    } catch (e) {
      console.error('Error loading reviews:', e)
      setReviews([])
    }
  }, [route.id])

  useEffect(() => {
    load()
  }, [load])

  const mine = reviews?.find((r) => r.user_id === user?.id)
  const isAuthor = user?.id === route.user_id
  const staff = isStaff(user)

  const summary = useMemo(() => {
    if (!reviews?.length) return null
    const avg = (f: (typeof CATEGORIES)[number]['field']) => reviews.reduce((s, r) => s + r[f], 0) / reviews.length
    const byCat = Object.fromEntries(CATEGORIES.map((c) => [c.key, avg(c.field)])) as Scores
    return { count: reviews.length, overall: (byCat.scenic + byCat.road + byCat.fun) / 3, byCat }
  }, [reviews])

  const startEditing = () => {
    setScores(mine ? { scenic: mine.scenic_rating, road: mine.road_quality_rating, fun: mine.fun_factor_rating } : { scenic: 0, road: 0, fun: 0 })
    setComment(mine?.comment ?? '')
    setError(null)
    setEditing(true)
  }

  const save = async () => {
    if (!user) return
    if (!scores.scenic || !scores.road || !scores.fun) {
      setError(tr('scoresRequired'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      await RatingsService.save(route.id, user.id, { ...scores, comment })
      setEditing(false)
      await load()
    } catch (e) {
      console.error('Error saving review:', e)
      setError(tr('saveFailed'))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (review: RouteReview) => {
    if (!window.confirm(tr('confirmRemove'))) return
    setBusy(true)
    try {
      await RatingsService.remove(review.id)
      if (review.user_id === user?.id) setEditing(false)
      await load()
    } catch (e) {
      console.error('Error removing review:', e)
      setError(tr('saveFailed'))
    } finally {
      setBusy(false)
    }
  }

  const date = (iso: string) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(iso))

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-bold">{tr('title')}</h2>
          {summary ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xl font-bold">{summary.overall.toFixed(1)}</span>
              <Stars value={summary.overall} size="h-5 w-5" />
              <span className="text-sm text-muted-foreground">{tr('riddenBy', { count: summary.count })}</span>
            </div>
          ) : (
            reviews && <p className="text-sm text-muted-foreground">{tr('empty')}</p>
          )}
        </div>

        {/* Call to action */}
        {!user ? (
          <Button asChild variant="outline">
            <Link href={`/${locale}/auth/login?redirect=${encodeURIComponent(pathname || `/${locale}`)}`}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {tr('loginToRate')}
            </Link>
          </Button>
        ) : isAuthor ? null : mine && !editing ? (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>{tr('youRodeIt')}</span>
            <Button size="sm" variant="ghost" onClick={startEditing}>
              <Pencil className="mr-1 h-4 w-4" />
              {tr('edit')}
            </Button>
          </div>
        ) : !editing ? (
          <Button onClick={startEditing}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {tr('iRodeIt')}
          </Button>
        ) : null}
      </div>

      {/* Category averages */}
      {summary && (
        <div className="grid gap-3 sm:grid-cols-3">
          {CATEGORIES.map((c) => (
            <div key={c.key} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">{t(c.label)}</span>
                <span className="font-semibold">{summary.byCat[c.key].toFixed(1)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-amber-400" style={{ width: `${(summary.byCat[c.key] / 5) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      {editing && (
        <Card className="space-y-4 p-4 md:p-6">
          <p className="font-medium">{tr('formTitle')}</p>
          <div className="space-y-2">
            {CATEGORIES.map((c) => (
              <StarInput
                key={c.key}
                label={t(c.label)}
                value={scores[c.key]}
                onChange={(v) => setScores((s) => ({ ...s, [c.key]: v }))}
              />
            ))}
          </div>
          <textarea
            className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            maxLength={1000}
            placeholder={tr('commentPlaceholder')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-wrap justify-between gap-2">
            <div>
              {mine && (
                <Button type="button" variant="ghost" className="text-red-600" disabled={busy} onClick={() => remove(mine)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {tr('remove')}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" disabled={busy} onClick={() => setEditing(false)}>
                {tr('cancel')}
              </Button>
              <Button type="button" disabled={busy} onClick={save}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {tr('save')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Reviews */}
      {reviews === null ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        reviews.length > 0 && (
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{r.user_name || tr('anonymous')}</span>
                    <Stars value={reviewScore(r)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{date(r.updated_at)}</span>
                    {staff && r.user_id !== user?.id && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        aria-label={tr('remove')}
                        title={tr('remove')}
                        disabled={busy}
                        onClick={() => remove(r)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {CATEGORIES.map((c) => `${t(c.label)} ${r[c.field]}/5`).join(' · ')}
                </p>
                {r.comment && <p className="mt-2 whitespace-pre-line break-words text-sm">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )
      )}
    </section>
  )
}
