'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, MapPin, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  CuratorReviewsService,
  changesText,
  type CuratorReviewDraft,
} from '@/lib/services/curator-reviews.service'
import type { CuratorConfidence, CuratorReviewSource, RouteCuratorReview } from '@/types'

const SCORES = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]
const SCORE_FIELDS = ['overall', 'scenic', 'road', 'fun'] as const
const CONFIDENCES: CuratorConfidence[] = ['high', 'medium', 'low']

const lines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean)

/** One source per line: "Title | URL | Site" (site optional) */
function parseSources(
  text: string,
  previous: CuratorReviewSource[],
): { sources: CuratorReviewSource[]; invalid: string[] } {
  const sources: CuratorReviewSource[] = []
  const invalid: string[] = []
  for (const line of lines(text)) {
    const [title, url, site] = line.split('|').map((p) => p.trim())
    try {
      const u = new URL(url)
      if (!title || !/^https?:$/.test(u.protocol)) throw new Error()
      // Keep the page language recorded by the research
      const lang = previous.find((p) => p.url === url)?.lang
      sources.push({ title, url, ...(site ? { site } : {}), ...(lang ? { lang } : {}) })
    } catch {
      invalid.push(line)
    }
  }
  return { sources, invalid }
}

const formatSources = (sources: CuratorReviewSource[]) =>
  sources.map((s) => [s.title, s.url, s.site].filter(Boolean).join(' | ')).join('\n')

/**
 * Staff-only editor for the MotoTrip review of a route (route edit page).
 * Saving goes live right away.
 */
export function CuratorReviewEditor({
  routeId,
  review,
  onSaved,
}: {
  routeId: string
  review: RouteCuratorReview | null | undefined
  onSaved: (review: RouteCuratorReview | null) => void
}) {
  const t = useTranslations('curatorAdmin')
  const tr = useTranslations('ratings')
  const [current, setCurrent] = useState(review ?? null)
  const [scores, setScores] = useState(() => ({
    overall: Number(review?.overall ?? 0),
    scenic: Number(review?.scenic ?? 0),
    road: Number(review?.road ?? 0),
    fun: Number(review?.fun ?? 0),
  }))
  const [confidence, setConfidence] = useState<CuratorConfidence>(review?.confidence ?? 'medium')
  const [verdict, setVerdict] = useState(review?.verdict ?? '')
  const [highlights, setHighlights] = useState((review?.highlights ?? []).join('\n'))
  const [warnings, setWarnings] = useState((review?.warnings ?? []).join('\n'))
  const [bestSeason, setBestSeason] = useState(review?.best_season ?? '')
  const [sourcesText, setSourcesText] = useState(formatSources(review?.sources ?? []))
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [confirmRemove, setConfirmRemove] = useState(false)

  const { sources, invalid } = useMemo(
    () => parseSources(sourcesText, current?.sources ?? []),
    [sourcesText, current],
  )
  const draft: CuratorReviewDraft = {
    ...scores,
    confidence,
    verdict: verdict.trim(),
    highlights: lines(highlights),
    warnings: lines(warnings),
    best_season: bestSeason.trim() || null,
    sources,
  }
  const hasTranslations = !!current && Object.keys(current.translations ?? {}).length > 0
  const dropsTranslations = hasTranslations && changesText(current, draft)

  const problems = [
    ...(SCORE_FIELDS.some((k) => !scores[k]) ? [t('errorScores')] : []),
    ...(!draft.verdict ? [t('errorVerdict')] : []),
    ...(sources.length === 0 ? [t('errorSources')] : []),
    ...(invalid.length ? [t('errorSourceLines', { count: invalid.length })] : []),
  ]

  const save = async () => {
    if (problems.length) return
    setBusy(true)
    setMessage(null)
    try {
      const saved = await CuratorReviewsService.save(routeId, current, draft)
      setCurrent(saved)
      onSaved(saved)
      setMessage({ kind: 'ok', text: t('saved') })
    } catch (e) {
      console.error('Error saving curator review:', e)
      setMessage({ kind: 'error', text: t('saveFailed') })
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    setMessage(null)
    try {
      await CuratorReviewsService.remove(routeId)
      setCurrent(null)
      onSaved(null)
      setMessage({ kind: 'ok', text: t('removed') })
    } catch (e) {
      console.error('Error removing curator review:', e)
      setMessage({ kind: 'error', text: t('saveFailed') })
    } finally {
      setBusy(false)
      setConfirmRemove(false)
    }
  }

  const label = (k: (typeof SCORE_FIELDS)[number]) =>
    k === 'overall' ? t('overall') : k === 'scenic' ? tr('scenic') : k === 'road' ? tr('roadQuality') : tr('funFactor')

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 shrink-0 rounded-md bg-gradient-brand flex items-center justify-center">
          <MapPin className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{tr('editorialTitle')}</h2>
          <p className="text-sm text-muted-foreground">{current ? t('descriptionEdit') : t('descriptionNew')}</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-5">
        {SCORE_FIELDS.map((k) => (
          <div key={k} className="flex flex-col justify-end gap-1.5">
            <Label htmlFor={`curator-${k}`}>{label(k)}</Label>
            <Select
              value={scores[k] ? String(scores[k]) : undefined}
              onValueChange={(v) => setScores((s) => ({ ...s, [k]: Number(v) }))}
            >
              <SelectTrigger id={`curator-${k}`}>
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {SCORES.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n.toFixed(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        <div className="flex flex-col justify-end gap-1.5">
          <Label htmlFor="curator-confidence">{t('confidence')}</Label>
          <Select value={confidence} onValueChange={(v) => setConfidence(v as CuratorConfidence)}>
            <SelectTrigger id="curator-confidence">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONFIDENCES.map((c) => (
                <SelectItem key={c} value={c}>
                  {t(`confidenceLevels.${c}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="curator-verdict">{t('verdict')}</Label>
        <Textarea id="curator-verdict" rows={4} maxLength={1500} value={verdict} onChange={(e) => setVerdict(e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="curator-highlights">{t('highlights')}</Label>
          <Textarea id="curator-highlights" rows={4} value={highlights} onChange={(e) => setHighlights(e.target.value)} />
          <p className="text-xs text-muted-foreground">{t('onePerLine')}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="curator-warnings">{t('warnings')}</Label>
          <Textarea id="curator-warnings" rows={4} value={warnings} onChange={(e) => setWarnings(e.target.value)} />
          <p className="text-xs text-muted-foreground">{t('onePerLine')}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="curator-season">{t('bestSeason')}</Label>
        <Input id="curator-season" maxLength={200} value={bestSeason} onChange={(e) => setBestSeason(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="curator-sources">{t('sources')}</Label>
        <Textarea
          id="curator-sources"
          rows={4}
          className="font-mono text-xs"
          value={sourcesText}
          onChange={(e) => setSourcesText(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">{t('sourcesHelp')}</p>
      </div>

      {dropsTranslations && (
        <p className="rounded-md border border-amber-400/50 bg-amber-500/10 p-3 text-sm">{t('dropsTranslations')}</p>
      )}
      {problems.length > 0 && (
        <ul className="text-sm text-destructive list-disc pl-5">
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={busy || problems.length > 0}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {current ? t('save') : t('create')}
        </Button>
        {current && (
          <Button variant="outline" onClick={() => setConfirmRemove(true)} disabled={busy}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t('remove')}
          </Button>
        )}
        {message && (
          <p role="status" className={message.kind === 'ok' ? 'text-sm text-green-600' : 'text-sm text-destructive'}>
            {message.text}
          </p>
        )}
      </div>

      <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('removeTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('removeDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>{t('remove')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
