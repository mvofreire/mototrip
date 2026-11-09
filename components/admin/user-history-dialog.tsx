'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Ban, Clock, Eye, EyeOff, Loader2, RotateCcw, UserCog } from 'lucide-react'
import { AdminService, type AdminUser, type ModerationLogEntry } from '@/lib/services/admin.service'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const ICONS = {
  suspend: Clock,
  ban: Ban,
  reactivate: RotateCcw,
  role_change: UserCog,
  hide_content: EyeOff,
  show_content: Eye,
} as const

/** Moderation and role-change history of one user */
export function UserHistoryDialog({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  const tu = useTranslations('admin.users')
  const locale = useLocale()
  const [entries, setEntries] = useState<ModerationLogEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setEntries(null)
    setError(null)
    AdminService.getModerationLog(user.id)
      .then(setEntries)
      .catch((e) => setError((e as Error).message))
  }, [user])

  const fmt = (d: string) =>
    new Date(d).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })
  const role = (r?: string) =>
    r && ['admin', 'curator', 'contributor'].includes(r) ? tu(`roles.${r}` as 'roles.admin') : r ?? '—'

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{tu('history.title')}</DialogTitle>
          <DialogDescription>{user?.full_name || user?.email}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : !entries ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{tu('history.empty')}</p>
          ) : (
            <ol className="space-y-4 border-l pl-5">
              {entries.map((e) => {
                const Icon = ICONS[e.action] ?? UserCog
                return (
                  <li key={e.id} className="relative">
                    <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border bg-background">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-sm font-medium">
                      {e.action === 'role_change'
                        ? tu('history.role_change', { from: role(e.details?.from), to: role(e.details?.to) })
                        : tu(`history.${e.action}`)}
                    </p>
                    {e.action === 'suspend' && e.suspended_until && (
                      <p className="text-xs text-muted-foreground">
                        {tu('history.until', { when: fmt(e.suspended_until) })}
                      </p>
                    )}
                    {e.action === 'ban' && e.details?.content_hidden && (
                      <p className="text-xs text-muted-foreground">{tu('history.withHiddenContent')}</p>
                    )}
                    {e.reason && <p className="mt-1 text-sm">“{e.reason}”</p>}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {fmt(e.created_at)}
                      {e.performed_by_name && ` · ${tu('history.by', { name: e.performed_by_name })}`}
                    </p>
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
