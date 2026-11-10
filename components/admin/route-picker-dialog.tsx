'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Loader2, MapPin, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { BlogAdminService, type RouteOption } from '@/lib/services/blog-admin.service'
import { regionLabel } from '@/lib/regions'

interface RoutePickerDialogProps {
  open: boolean
  title: string
  onOpenChange: (open: boolean) => void
  onPick: (route: RouteOption) => void
}

/** Search the published routes and pick one (route card or cover) */
export function RoutePickerDialog({ open, title, onOpenChange, onPick }: RoutePickerDialogProps) {
  const t = useTranslations('admin.blog')
  const locale = useLocale()
  const [term, setTerm] = useState('')
  const [routes, setRoutes] = useState<RouteOption[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    const id = window.setTimeout(async () => {
      try {
        const found = await BlogAdminService.searchRoutes(term)
        if (!cancelled) setRoutes(found)
      } catch (e) {
        console.error('Route search failed:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 250)
    return () => {
      cancelled = true
      window.clearTimeout(id)
    }
  }, [term, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input autoFocus value={term} onChange={(e) => setTerm(e.target.value)} placeholder={t('pickerSearch')} className="pl-10" />
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          {loading && routes.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : routes.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t('pickerEmpty')}</p>
          ) : (
            <ul className="divide-y">
              {routes.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => onPick(r)}
                    className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-muted"
                  >
                    {r.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.thumbnail_url} alt="" className="h-10 w-16 shrink-0 rounded object-cover" />
                    ) : (
                      <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded bg-muted">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{r.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {[regionLabel(r, locale), r.country].filter(Boolean).join(' · ')} · {r.slug}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
