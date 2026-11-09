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

const dateLocales = { pt: ptBR, en: enUS, es, fr, de } as const

interface AdminRoutesTableProps {
  routes: AdminRouteWithUser[]
  /** Only admins can delete routes */
  canDelete: boolean
  onApprove: (id: string) => Promise<void>
  onReject: (id: string, note: string) => Promise<void>
  onToggleFeatured: (id: string, featured: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onDeleteBulk: (ids: string[]) => Promise<void>
}

export function AdminRoutesTable({
  routes,
  canDelete,
  onApprove,
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

  const allSelected = routes.length > 0 && selected.size === routes.length

  const handleReject = async () => {
    if (!rejectTarget || !rejectNote.trim()) return
    const target = rejectTarget
    await run(target.id, () => onReject(target.id, rejectNote.trim()))
    setRejectTarget(null)
    setRejectNote('')
  }

  return (
    <>
      {canDelete && selected.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border bg-muted/50 p-4">
          <span className="text-sm font-medium">
            {selected.size} {t('selectedRoutes')}
          </span>
          <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t('deleteSelected')}
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {canDelete && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={() =>
                      setSelected(allSelected ? new Set() : new Set(routes.map((r) => r.id)))
                    }
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              <TableHead>{t('table.title')}</TableHead>
              <TableHead>{t('table.user')}</TableHead>
              <TableHead>{t('table.category')}</TableHead>
              <TableHead className="text-right">{t('table.distance')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead className="text-center">{t('table.featured')}</TableHead>
              <TableHead>{t('table.updated')}</TableHead>
              <TableHead className="text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                  {t('table.noRoutes')}
                </TableCell>
              </TableRow>
            ) : (
              routes.map((route) => (
                <TableRow key={route.id}>
                  {canDelete && (
                    <TableCell>
                      <Checkbox
                        checked={selected.has(route.id)}
                        onCheckedChange={() => toggleSelect(route.id)}
                        aria-label={`Select ${route.title}`}
                      />
                    </TableCell>
                  )}
                  <TableCell className="max-w-[260px]">
                    <Link
                      href={`/${locale}/routes/${route.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 font-medium hover:underline"
                    >
                      <span className="truncate">{route.title}</span>
                      <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge className={getDifficultyColor(route.difficulty)} variant="outline">
                        {tAll(`difficulty.${route.difficulty}`)}
                      </Badge>
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
                    <Badge className={getCategoryColor(route.category)} variant="outline">
                      {tAll(`categories.${route.category}`)}
                    </Badge>
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
              {t('bulkDeleteDialog.description', { count: selected.size })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>
              {t('deleteDialog.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await onDeleteBulk(Array.from(selected))
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
