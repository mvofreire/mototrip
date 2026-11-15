'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Check, ExternalLink, Loader2, Pencil, Shield, Star, Trash2, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { de, enUS, es, fr, ptBR } from 'date-fns/locale'
import type { AdminRouteWithUser } from '@/lib/services/admin.service'
import { RouteStatusBadge } from '@/components/features/routes/route-status-badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { routePath } from '@/lib/route-url'

const dateLocales = { pt: ptBR, en: enUS, es, fr, de } as const

interface Props {
  route: AdminRouteWithUser | null
  canDelete: boolean
  onClose: () => void
  onApprove: (id: string) => Promise<void>
  onReject: (id: string, note: string) => Promise<void>
  onToggleFeatured: (id: string, featured: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

/** Side panel with a route's details and review actions (routes admin) */
export function AdminRouteDrawer({ route, canDelete, onClose, onApprove, onReject, onToggleFeatured, onDelete }: Props) {
  const t = useTranslations('admin')
  const tAll = useTranslations()
  const locale = useLocale()
  const dateLocale = dateLocales[locale as keyof typeof dateLocales] ?? enUS
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<'view' | 'reject' | 'delete'>('view')
  const [note, setNote] = useState('')

  // Back to the details when another route opens
  useEffect(() => {
    setMode('view')
    setNote('')
  }, [route?.id])

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }

  const ago = (iso: string) => formatDistanceToNow(new Date(iso), { addSuffix: true, locale: dateLocale })
  const hours = route ? Math.floor(route.duration_minutes / 60) : 0
  const minutes = route ? route.duration_minutes % 60 : 0

  return (
    <Sheet open={!!route} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        {route && (
          <>
            <SheetHeader className="space-y-2 border-b p-5 pr-12 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <RouteStatusBadge status={route.status} />
                {route.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:text-yellow-400">
                    <Star className="h-3 w-3 fill-current" /> {t('table.featured')}
                  </span>
                )}
              </div>
              <SheetTitle className="font-sans text-lg normal-case tracking-normal">{route.title}</SheetTitle>
              <SheetDescription>{[route.region, route.country].filter(Boolean).join(', ') || '—'}</SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              {route.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={route.thumbnail_url} alt="" className="aspect-[16/9] w-full rounded-lg border object-cover" />
              )}

              <dl className="grid grid-cols-3 gap-2 text-center">
                {[
                  [t('drawer.distance'), `${Number(route.distance_km).toFixed(0)} km`],
                  [t('drawer.duration'), hours ? `${hours}h${minutes ? String(minutes).padStart(2, '0') : ''}` : `${minutes} min`],
                  [t('drawer.difficulty'), tAll(`difficulty.${route.difficulty}`)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-muted/60 px-2 py-2">
                    <dd className="text-sm font-semibold">{v}</dd>
                    <dt className="text-[11px] text-muted-foreground">{k}</dt>
                  </div>
                ))}
              </dl>

              <dl className="space-y-2 text-sm">
                <Row label={t('drawer.author')}>
                  {route.user_name || '—'}
                  {route.user_email && <span className="block text-xs text-muted-foreground">{route.user_email}</span>}
                </Row>
                <Row label={t('table.category')}>{tAll(`categories.${route.category}`)}</Row>
                <Row label={t('drawer.created')}>{ago(route.created_at)}</Row>
                <Row label={t('table.updated')}>{ago(route.updated_at)}</Row>
                <Row label={t('table.curator')}>
                  {route.curator_rating != null ? (
                    <span>
                      <strong className="tabular-nums">{Number(route.curator_rating).toFixed(1)}</strong>
                      {route.curator_confidence && (
                        <span className={route.curator_confidence === 'low' ? 'ml-1.5 text-amber-600' : 'ml-1.5 text-muted-foreground'}>
                          · {tAll(`curatorAdmin.confidenceLevels.${route.curator_confidence}`)}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">{t('curatorFilter.missing')}</span>
                  )}
                </Row>
              </dl>

              {route.status === 'rejected' && route.review_note && (
                <div className="rounded-lg border border-red-300/60 bg-red-500/5 p-3 text-sm">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400">{t('drawer.rejectReason')}</p>
                  {route.review_note}
                </div>
              )}

              {route.description && <p className="line-clamp-6 whitespace-pre-line text-sm text-muted-foreground">{route.description}</p>}

              {mode === 'reject' && (
                <div className="space-y-2 rounded-lg border p-3">
                  <Label htmlFor="drawer-reject">{t('review.reasonLabel')}</Label>
                  <p className="text-xs text-muted-foreground">{t('review.rejectDescription')}</p>
                  <Textarea id="drawer-reject" rows={4} autoFocus value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('review.reasonPlaceholder')} />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setMode('view')}>{t('deleteDialog.cancel')}</Button>
                    <Button size="sm" disabled={!note.trim() || busy} onClick={() => run(async () => { await onReject(route.id, note.trim()); setMode('view') })}>
                      {t('review.reject')}
                    </Button>
                  </div>
                </div>
              )}
              {mode === 'delete' && (
                <div className="space-y-2 rounded-lg border border-destructive/50 p-3">
                  <p className="text-sm font-medium">{t('deleteDialog.title')}</p>
                  <p className="text-xs text-muted-foreground">{t('deleteDialog.description')}</p>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setMode('view')}>{t('deleteDialog.cancel')}</Button>
                    <Button size="sm" variant="destructive" disabled={busy} onClick={() => run(() => onDelete(route.id))}>
                      {t('deleteDialog.delete')}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 border-t p-4">
              {route.status !== 'approved' && (
                <Button disabled={busy} onClick={() => run(() => onApprove(route.id))}>
                  {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Check className="mr-1.5 h-4 w-4" />}
                  {t('review.approve')}
                </Button>
              )}
              {route.status !== 'rejected' && (
                <Button variant="outline" disabled={busy} onClick={() => setMode('reject')}>
                  <X className="mr-1.5 h-4 w-4" />
                  {t('review.reject')}
                </Button>
              )}
              <Button variant="outline" disabled={busy} onClick={() => run(() => onToggleFeatured(route.id, !route.featured))}>
                <Star className={route.featured ? 'mr-1.5 h-4 w-4 fill-yellow-500 text-yellow-500' : 'mr-1.5 h-4 w-4'} />
                {route.featured ? t('bulk.unfeature') : t('bulk.feature')}
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/${locale}/routes/${route.id}/edit`}>
                  <Pencil className="mr-1.5 h-4 w-4" />
                  {t('review.edit')}
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href={`/${locale}/routes/${route.id}/edit#curator-review`}>
                  <Shield className="mr-1.5 h-4 w-4" />
                  {t('drawer.curatorReview')}
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href={routePath(locale, route)} target="_blank">
                  <ExternalLink className="mr-1.5 h-4 w-4" />
                  {t('drawer.viewOnSite')}
                </Link>
              </Button>
              {canDelete && (
                <Button variant="ghost" className="text-destructive hover:text-destructive" disabled={busy} onClick={() => setMode('delete')}>
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  {t('deleteDialog.delete')}
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}
