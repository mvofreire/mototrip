'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { AdminRouteWithUser } from '@/lib/services/admin.service'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Check, ExternalLink, Pencil, Star, Trash2, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { de, enUS, es, fr, ptBR } from 'date-fns/locale'
import { Checkbox } from '@/components/ui/checkbox'
import { RouteStatusBadge } from '@/components/features/routes/route-status-badge'
import { getCategoryColor, getDifficultyColor } from '@/lib/utils'
import { routePath } from '@/lib/route-url'

const dateLocales = { pt: ptBR, en: enUS, es, fr, de } as const

interface AdminRoutesTableProps {
  routes: AdminRouteWithUser[]
  /** Only admins can delete routes */
  canDelete: boolean
  /** Open the route's detail panel */
  onOpen: (id: string) => void
  onApprove: (id: string) => Promise<void>
  onApproveBulk: (ids: string[]) => Promise<void>
  onFeatureBulk: (ids: string[], featured: boolean) => Promise<void>
  onReject: (id: string, note: string) => Promise<void>
  onToggleFeatured: (id: string, featured: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onDeleteBulk: (ids: string[]) => Promise<void>
}

export function AdminRoutesTable({
  routes,
  canDelete,
  onOpen,
  onApprove,
  onApproveBulk,
  onFeatureBulk,
  onReject,
  onToggleFeatured,
  onDelete,
  onDeleteBulk,
}: AdminRoutesTableProps) {
  const t = useTranslations('admin')
  const tAll = useTranslations()
  const locale = useLocale()
  const dateLocale = dateLocales[locale as keyof typeof dateLocales] ?? enUS

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminRouteWithUser | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<AdminRouteWithUser | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  const run = async (id: string, fn: () => Promise<void>) => {
    setBusy(id)
    try {
      await fn()
    } finally {
      setBusy(null)
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  // Selection only counts routes still in the (filtered) list
  const selectedIds = routes.filter((r) => selected.has(r.id)).map((r) => r.id)
  const allSelected = routes.length > 0 && selectedIds.length === routes.length
  const [bulkBusy, setBulkBusy] = useState(false)
  const bulk = async (fn: () => Promise<void>) => {
    setBulkBusy(true)
    try {
      await fn()
      setSelected(new Set())
    } finally {
      setBulkBusy(false)
    }
  }

  const handleReject = async () => {
    if (!rejectTarget || !rejectNote.trim()) return
    const target = rejectTarget
    await run(target.id, () => onReject(target.id, rejectNote.trim()))
    setRejectTarget(null)
    setRejectNote('')
  }

  return (
    <>
      {selectedIds.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-primary/50 bg-primary/5 px-3 py-2">
          <span className="text-sm font-medium">
            {selectedIds.length} {t('selectedRoutes')}
          </span>
          <span className="flex-1" />
          <Button size="sm" variant="outline" disabled={bulkBusy} onClick={() => bulk(() => onApproveBulk(selectedIds))}>
            <Check className="mr-1.5 h-4 w-4 text-green-600" />
            {t('bulk.approve')}
          </Button>
          <Button size="sm" variant="outline" disabled={bulkBusy} onClick={() => bulk(() => onFeatureBulk(selectedIds, true))}>
            <Star className="mr-1.5 h-4 w-4 text-yellow-500" />
            {t('bulk.feature')}
          </Button>
          <Button size="sm" variant="outline" disabled={bulkBusy} onClick={() => bulk(() => onFeatureBulk(selectedIds, false))}>
            {t('bulk.unfeature')}
          </Button>
          {canDelete && (
            <Button variant="destructive" size="sm" disabled={bulkBusy} onClick={() => setBulkDeleteOpen(true)}>
              <Trash2 className="mr-1.5 h-4 w-4" />
              {t('deleteSelected')}
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
            {t('bulk.clear')}
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[44px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={() => setSelected(allSelected ? new Set() : new Set(routes.map((r) => r.id)))}
                  aria-label={t('bulk.selectAll')}
                />
              </TableHead>
              <TableHead>{t('table.title')}</TableHead>
              <TableHead>{t('table.user')}</TableHead>
              <TableHead>{t('table.category')}</TableHead>
              <TableHead className="text-right">{t('table.distance')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead className="whitespace-nowrap">{t('table.curator')}</TableHead>
              <TableHead className="text-center">{t('table.featured')}</TableHead>
              <TableHead>{t('table.updated')}</TableHead>
              <TableHead className="text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                  {t('table.noRoutes')}
                </TableCell>
              </TableRow>
            ) : (
              routes.map((route) => (
                <TableRow key={route.id} data-state={selected.has(route.id) ? 'selected' : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(route.id)}
                      onCheckedChange={() => toggleSelect(route.id)}
                      aria-label={route.title}
                    />
                  </TableCell>
                  <TableCell className="min-w-[240px] max-w-[320px]">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onOpen(route.id)}
                        className="h-10 w-14 shrink-0 overflow-hidden rounded-md border bg-muted"
                        aria-label={route.title}
                        tabIndex={-1}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {route.thumbnail_url && <img src={route.thumbnail_url} alt="" className="h-full w-full object-cover" />}
                      </button>
                      <div className="min-w-0">
                        <button type="button" onClick={() => onOpen(route.id)} className="block max-w-full truncate text-left font-medium hover:underline">
                          {route.title}
                        </button>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="truncate">{[route.region, route.country].filter(Boolean).join(', ')}</span>
                          <Link href={routePath(locale, route)} target="_blank" title={t('drawer.viewOnSite')} aria-label={t('drawer.viewOnSite')} className="shrink-0 hover:text-foreground">
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{route.user_name || '—'}</span>
                      {route.user_email && (
                        <span className="text-xs text-muted-foreground">{route.user_email}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <Badge className={getCategoryColor(route.category)} variant="outline">
                        {tAll(`categories.${route.category}`)}
                      </Badge>
                      <Badge className={getDifficultyColor(route.difficulty)} variant="outline">
                        {tAll(`difficulty.${route.difficulty}`)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    {Number(route.distance_km).toFixed(1)} km
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    <RouteStatusBadge status={route.status} />
                    {route.status === 'rejected' && route.review_note && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground" title={route.review_note}>
                        {route.review_note}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {route.curator_rating != null ? (
                      <div className="flex flex-col">
                        <span className="font-semibold tabular-nums">{Number(route.curator_rating).toFixed(1)}</span>
                        {route.curator_confidence && (
                          <span
                            className={`text-xs ${
                              route.curator_confidence === 'low' ? 'text-amber-600 font-medium' : 'text-muted-foreground'
                            }`}
                          >
                            {tAll(`curatorAdmin.confidenceLevels.${route.curator_confidence}`)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy === route.id}
                      aria-label={t('table.featured')}
                      onClick={() => run(route.id, () => onToggleFeatured(route.id, !route.featured))}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          route.featured ? 'fill-yellow-500 text-yellow-500' : 'text-gray-500'
                        }`}
                      />
                    </Button>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(route.updated_at ?? route.created_at), {
                      addSuffix: true,
                      locale: dateLocale,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {route.status !== 'approved' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title={t('review.approve')}
                          aria-label={t('review.approve')}
                          disabled={busy === route.id}
                          onClick={() => run(route.id, () => onApprove(route.id))}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      {route.status !== 'rejected' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title={t('review.reject')}
                          aria-label={t('review.reject')}
                          disabled={busy === route.id}
                          onClick={() => {
                            setRejectNote('')
                            setRejectTarget(route)
                          }}
                        >
                          <X className="h-4 w-4 text-amber-600" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" asChild title={t('review.edit')}>
                        <Link href={`/${locale}/routes/${route.id}/edit`} aria-label={t('review.edit')}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title={t('deleteDialog.delete')}
                          aria-label={t('deleteDialog.delete')}
                          onClick={() => setDeleteTarget(route)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Reject */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('review.rejectTitle')}</DialogTitle>
            <DialogDescription>
              {t('review.rejectDescription')}
              <strong className="mt-2 block text-foreground">{rejectTarget?.title}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-note">{t('review.reasonLabel')}</Label>
            <Textarea
              id="reject-note"
              rows={4}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder={t('review.reasonPlaceholder')}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              {t('deleteDialog.cancel')}
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectNote.trim() || busy === rejectTarget?.id}
            >
              {t('review.reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk delete */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('bulkDeleteDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('bulkDeleteDialog.description', { count: selectedIds.length })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>
              {t('deleteDialog.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await onDeleteBulk(selectedIds)
                setSelected(new Set())
                setBulkDeleteOpen(false)
              }}
            >
              {t('deleteDialog.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('deleteDialog.description')}
              <strong className="mt-2 block text-foreground">{deleteTarget?.title}</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {t('deleteDialog.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (deleteTarget) await onDelete(deleteTarget.id)
                setDeleteTarget(null)
              }}
            >
              {t('deleteDialog.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
