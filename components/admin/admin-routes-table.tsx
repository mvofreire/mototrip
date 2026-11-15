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
import { Check, ExternalLink, Loader2, MoreHorizontal, PanelRight, Pencil, Shield, Star, Trash2, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { de, enUS, es, fr, ptBR } from 'date-fns/locale'
import { Checkbox } from '@/components/ui/checkbox'
import { RouteStatusBadge } from '@/components/features/routes/route-status-badge'
import { cn, getCategoryColor, getDifficultyColor } from '@/lib/utils'
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

      <div className="overflow-hidden rounded-xl border bg-card">
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
              <TableHead className="hidden xl:table-cell">{t('table.category')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead className="hidden whitespace-nowrap lg:table-cell">{t('table.curator')}</TableHead>
              <TableHead className="hidden whitespace-nowrap 2xl:table-cell">{t('table.updated')}</TableHead>
              <TableHead className="w-[52px]">
                <span className="sr-only">{t('table.actions')}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  {t('table.noRoutes')}
                </TableCell>
              </TableRow>
            ) : (
              routes.map((route) => (
                <TableRow key={route.id} data-state={selected.has(route.id) ? 'selected' : undefined}>
                  <TableCell>
                    <Checkbox checked={selected.has(route.id)} onCheckedChange={() => toggleSelect(route.id)} aria-label={route.title} />
                  </TableCell>
                  {/* w-full + max-w-0 lets the title column take the free space and truncate instead of scrolling */}
                  <TableCell className="w-full max-w-0">
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
                        <button
                          type="button"
                          onClick={() => onOpen(route.id)}
                          className="flex max-w-full items-center gap-1.5 text-left font-medium hover:underline"
                        >
                          <span className="truncate">{route.title}</span>
                          {route.featured && <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-500 text-yellow-500" aria-label={t('table.featured')} />}
                        </button>
                        <p className="truncate text-xs text-muted-foreground">
                          {[
                            [route.region, route.country].filter(Boolean).join(', '),
                            `${Number(route.distance_km).toFixed(0)} km`,
                            route.user_name && t('table.by', { name: route.user_name }),
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <div className="flex flex-col items-start gap-1">
                      <Badge className={cn('whitespace-nowrap', getCategoryColor(route.category))} variant="outline">
                        {tAll(`categories.${route.category}`)}
                      </Badge>
                      <Badge className={cn('whitespace-nowrap', getDifficultyColor(route.difficulty))} variant="outline">
                        {tAll(`difficulty.${route.difficulty}`)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <RouteStatusBadge status={route.status} />
                    {route.status === 'rejected' && route.review_note && (
                      <p className="mt-1 truncate text-xs text-muted-foreground" title={route.review_note}>
                        {route.review_note}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap lg:table-cell">
                    {route.curator_rating != null ? (
                      <div className="flex flex-col">
                        <span className="font-semibold tabular-nums">{Number(route.curator_rating).toFixed(1)}</span>
                        {route.curator_confidence && (
                          <span className={cn('text-xs', route.curator_confidence === 'low' ? 'font-medium text-amber-600' : 'text-muted-foreground')}>
                            {tAll(`curatorAdmin.confidenceLevels.${route.curator_confidence}`)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap text-sm text-muted-foreground 2xl:table-cell">
                    {formatDistanceToNow(new Date(route.updated_at ?? route.created_at), { addSuffix: true, locale: dateLocale })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={busy === route.id} aria-label={t('table.actions')}>
                          {busy === route.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem onSelect={() => onOpen(route.id)}>
                          <PanelRight className="mr-2 h-4 w-4" />
                          {t('table.details')}
                        </DropdownMenuItem>
                        {route.status !== 'approved' && (
                          <DropdownMenuItem onSelect={() => run(route.id, () => onApprove(route.id))}>
                            <Check className="mr-2 h-4 w-4 text-green-600" />
                            {t('review.approve')}
                          </DropdownMenuItem>
                        )}
                        {route.status !== 'rejected' && (
                          <DropdownMenuItem
                            onSelect={() => {
                              setRejectNote('')
                              setRejectTarget(route)
                            }}
                          >
                            <X className="mr-2 h-4 w-4 text-amber-600" />
                            {t('review.reject')}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onSelect={() => run(route.id, () => onToggleFeatured(route.id, !route.featured))}>
                          <Star className={cn('mr-2 h-4 w-4', route.featured && 'fill-yellow-500 text-yellow-500')} />
                          {route.featured ? t('bulk.unfeature') : t('bulk.feature')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/${locale}/routes/${route.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t('review.edit')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/${locale}/routes/${route.id}/edit#curator-review`}>
                            <Shield className="mr-2 h-4 w-4" />
                            {t('drawer.curatorReview')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={routePath(locale, route)} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            {t('drawer.viewOnSite')}
                          </Link>
                        </DropdownMenuItem>
                        {canDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setDeleteTarget(route)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('deleteDialog.delete')}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
