'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { addDays } from 'date-fns'
import { AlertTriangle, Ban, Clock, Loader2 } from 'lucide-react'
import type { AdminUser } from '@/lib/services/admin.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export type ModerationMode = 'suspend' | 'ban'

const DURATIONS = [1, 3, 7, 30] as const
type Duration = (typeof DURATIONS)[number] | 'custom'

/** yyyy-MM-ddTHH:mm in local time, for <input type="datetime-local"> */
function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}

interface Props {
  user: AdminUser | null
  mode: ModerationMode
  onClose: () => void
  onConfirm: (
    user: AdminUser,
    options: { until?: Date; reason: string; hideContent: boolean },
  ) => Promise<void>
}

export function UserModerationDialog({ user, mode, onClose, onConfirm }: Props) {
  const tu = useTranslations('admin.users')
  const locale = useLocale()
  const [duration, setDuration] = useState<Duration>(7)
  const [custom, setCustom] = useState('')
  const [reason, setReason] = useState('')
  const [hideContent, setHideContent] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setDuration(7)
      setCustom(toLocalInput(addDays(new Date(), 7)))
      setReason('')
      setHideContent(true)
      setError(null)
    }
  }, [user])

  const until =
    mode === 'suspend'
      ? duration === 'custom'
        ? custom
          ? new Date(custom)
          : null
        : addDays(new Date(), duration)
      : undefined

  const untilValid = mode !== 'suspend' || (!!until && until.getTime() > Date.now())
  const canSubmit = !!reason.trim() && untilValid && !saving

  const submit = async () => {
    if (!user || !canSubmit) return
    setSaving(true)
    setError(null)
    try {
      await onConfirm(user, { until: until ?? undefined, reason: reason.trim(), hideContent: isBan && hideContent })
      onClose()
    } catch (e) {
      setError((e as Error).message || tu('moderation.error'))
    } finally {
      setSaving(false)
    }
  }

  const isBan = mode === 'ban'
  const name = user?.full_name || user?.email

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBan ? (
              <Ban className="h-5 w-5 text-destructive" />
            ) : (
              <Clock className="h-5 w-5 text-amber-600" />
            )}
            {isBan ? tu('moderation.banTitle', { name: name ?? '' }) : tu('moderation.suspendTitle', { name: name ?? '' })}
          </DialogTitle>
          <DialogDescription>
            {isBan ? tu('moderation.banDescription') : tu('moderation.suspendDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isBan && (
            <div className="flex gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{tu('moderation.banWarning')}</span>
            </div>
          )}

          {isBan && (
            <label htmlFor="hide-content" className="flex cursor-pointer items-start gap-3 rounded-md border p-3">
              <Checkbox
                id="hide-content"
                checked={hideContent}
                onCheckedChange={(v) => setHideContent(v === true)}
                className="mt-0.5"
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium">{tu('moderation.hideContent')}</span>
                <span className="block text-xs text-muted-foreground">
                  {tu('moderation.hideContentHint', {
                    routes: user?.routes_count ?? 0,
                    comments: user?.comments_count ?? 0,
                  })}
                </span>
              </span>
            </label>
          )}

          {!isBan && (
            <div className="space-y-2">
              <Label>{tu('moderation.duration')}</Label>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map((d) => (
                  <Button
                    key={d}
                    type="button"
                    size="sm"
                    variant={duration === d ? 'default' : 'outline'}
                    onClick={() => setDuration(d)}
                  >
                    {tu('moderation.days', { count: d })}
                  </Button>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant={duration === 'custom' ? 'default' : 'outline'}
                  onClick={() => setDuration('custom')}
                >
                  {tu('moderation.custom')}
                </Button>
              </div>
              {duration === 'custom' && (
                <Input
                  type="datetime-local"
                  value={custom}
                  min={toLocalInput(new Date())}
                  onChange={(e) => setCustom(e.target.value)}
                  aria-label={tu('moderation.custom')}
                />
              )}
              <p className={cn('text-xs', untilValid ? 'text-muted-foreground' : 'text-destructive')}>
                {untilValid && until
                  ? tu('moderation.until', {
                      when: until.toLocaleString(locale, { dateStyle: 'long', timeStyle: 'short' }),
                    })
                  : tu('moderation.untilInvalid')}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="moderation-reason">{tu('moderation.reason')}</Label>
            <Textarea
              id="moderation-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={tu('moderation.reasonPlaceholder')}
            />
            <p className="text-xs text-muted-foreground">{tu('moderation.reasonHint')}</p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {tu('moderation.cancel')}
          </Button>
          <Button
            variant={isBan ? 'destructive' : 'default'}
            onClick={submit}
            disabled={!canSubmit}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isBan ? tu('actions.ban') : tu('actions.suspend')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
