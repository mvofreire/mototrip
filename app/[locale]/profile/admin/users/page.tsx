'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import { de, enUS, es, fr, pt } from 'date-fns/locale'
import {
  Ban,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  EyeOff,
  History,
  Loader2,
  Mail,
  MessageSquare,
  MoreHorizontal,
  RefreshCw,
  RotateCcw,
  Route as RouteIcon,
  Search,
  Shield,
  ShieldCheck,
  UserCog,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { AdminService, AdminUser, AccountStatus } from '@/lib/services/admin.service'
import { AdminPageHeader, useAdmin } from '@/components/admin/admin-shell'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UserModerationDialog, type ModerationMode } from '@/components/admin/user-moderation-dialog'
import { UserHistoryDialog } from '@/components/admin/user-history-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { cn } from '@/lib/utils'

const dateLocales = { pt, en: enUS, es, fr, de } as const

type StatusFilter = 'all' | AccountStatus | 'unconfirmed'
type RoleFilter = 'all' | 'admin' | 'curator' | 'contributor'
type Notice = { kind: 'success' | 'error'; text: string }

function initials(u: AdminUser) {
  const base = (u.full_name || u.email).trim()
  const parts = base.split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const { isAdmin } = useAdmin()
  const locale = useLocale()
  const t = useTranslations('admin')
  const tu = useTranslations('admin.users')

  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [moderate, setModerate] = useState<{ user: AdminUser; mode: ModerationMode } | null>(null)
  const [reactivate, setReactivate] = useState<AdminUser | null>(null)
  const [history, setHistory] = useState<AdminUser | null>(null)
  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null)
  const [roleChoice, setRoleChoice] = useState<'contributor' | 'curator'>('contributor')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      setUsers(await AdminService.listUsers())
    } catch (e) {
      setLoadError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Managing users is admin-only (curators see a notice below)
  useEffect(() => {
    if (isAdmin) loadUsers()
  }, [isAdmin, loadUsers])

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(null), 5000)
    return () => clearTimeout(id)
  }, [notice])

  const counts = useMemo(
    () => ({
      all: users.length,
      active: users.filter((u) => u.account_status === 'active').length,
      unconfirmed: users.filter((u) => !u.email_confirmed_at).length,
      suspended: users.filter((u) => u.account_status === 'suspended').length,
      banned: users.filter((u) => u.account_status === 'banned').length,
    }),
    [users],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      if (statusFilter === 'unconfirmed' ? !!u.email_confirmed_at : statusFilter !== 'all' && u.account_status !== statusFilter)
        return false
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      return !q || u.email.toLowerCase().includes(q) || (u.full_name ?? '').toLowerCase().includes(q)
    })
  }, [users, search, statusFilter, roleFilter])

  const nameOf = (u: AdminUser) => u.full_name || u.email

  const run = async (u: AdminUser, action: () => Promise<void>, success: string) => {
    setBusy(u.id)
    try {
      await action()
      setNotice({ kind: 'success', text: success })
    } catch (e) {
      setNotice({ kind: 'error', text: (e as Error).message })
      throw e
    } finally {
      setBusy(null)
    }
  }

  const handleRoleChange = (u: AdminUser, role: 'contributor' | 'curator') => {
    if (role === u.role) return
    run(
      u,
      async () => {
        await AdminService.setUserRole(u.id, role)
        setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role } : x)))
      },
      tu('notice.role', { name: nameOf(u), role: tu(`roles.${role}`) }),
    ).catch(() => {})
  }

  const handleResend = (u: AdminUser) =>
    run(u, () => AdminService.resendConfirmation(u.email), tu('notice.resent', { email: u.email })).catch(
      () => {},
    )

  const handleCopy = async (u: AdminUser) => {
    try {
      await navigator.clipboard.writeText(u.email)
      setNotice({ kind: 'success', text: tu('notice.copied') })
    } catch {}
  }

  const handleModerate = async (
    u: AdminUser,
    { until, reason, hideContent }: { until?: Date; reason: string; hideContent: boolean },
  ) => {
    const mode = moderate?.mode ?? 'suspend'
    const status: AccountStatus = mode === 'ban' ? 'banned' : 'suspended'
    setBusy(u.id)
    try {
      await AdminService.moderateUser(u.id, status, { until, reason, hideContent })
      setUsers((prev) =>
        prev.map((x) =>
          x.id === u.id
            ? {
                ...x,
                account_status: status,
                suspended_until: status === 'suspended' ? until!.toISOString() : null,
                moderation_reason: reason,
                moderated_at: new Date().toISOString(),
                content_hidden: status === 'banned' && hideContent,
              }
            : x,
        ),
      )
      setNotice({
        kind: 'success',
        text: mode === 'ban' ? tu('notice.banned', { name: nameOf(u) }) : tu('notice.suspended', { name: nameOf(u) }),
      })
    } finally {
      setBusy(null)
    }
  }

  const handleReactivate = (u: AdminUser) =>
    run(
      u,
      async () => {
        await AdminService.moderateUser(u.id, 'active')
        setUsers((prev) =>
          prev.map((x) =>
            x.id === u.id
              ? { ...x, account_status: 'active', suspended_until: null, moderation_reason: null, content_hidden: false }
              : x,
          ),
        )
      },
      tu('notice.reactivated', { name: nameOf(u) }),
    ).catch(() => {})

  const handleContentHidden = (u: AdminUser, hidden: boolean) =>
    run(
      u,
      async () => {
        await AdminService.setContentHidden(u.id, hidden)
        setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, content_hidden: hidden } : x)))
      },
      hidden ? tu('notice.contentHidden', { name: nameOf(u) }) : tu('notice.contentShown', { name: nameOf(u) }),
    ).catch(() => {})

  const ago = (date: string | null) =>
    date
      ? formatDistanceToNow(new Date(date), {
          addSuffix: true,
          locale: dateLocales[locale as keyof typeof dateLocales] ?? enUS,
        })
      : '—'
  const fullDate = (date: string | null) =>
    date ? new Date(date).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' }) : undefined

  if (!isAdmin) {
    return (
      <div className="rounded-xl border p-10 text-center text-muted-foreground">
        <Shield className="mx-auto mb-3 h-6 w-6" />
        {tu('adminOnly')}
      </div>
    )
  }

  const stats: { key: StatusFilter; label: string; value: number; icon: typeof Users; tone: string }[] = [
    { key: 'all', label: tu('stats.all'), value: counts.all, icon: Users, tone: 'text-foreground' },
    { key: 'active', label: tu('stats.active'), value: counts.active, icon: UserCheck, tone: 'text-green-600' },
    { key: 'unconfirmed', label: tu('stats.unconfirmed'), value: counts.unconfirmed, icon: Mail, tone: 'text-sky-600' },
    { key: 'suspended', label: tu('stats.suspended'), value: counts.suspended, icon: Clock, tone: 'text-amber-600' },
    { key: 'banned', label: tu('stats.banned'), value: counts.banned, icon: Ban, tone: 'text-destructive' },
  ]

  return (
    <div>
      <AdminPageHeader title={t('shell.users')} description={tu('description')} />

      {/* Stats double as status filters */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ key, label, value, icon: Icon, tone }) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            aria-pressed={statusFilter === key}
            className={cn(
              'rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent sm:p-4',
              statusFilter === key && 'border-primary ring-1 ring-primary',
            )}
          >
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              {label}
              <Icon className={cn('h-4 w-4', tone)} />
            </div>
            <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="relative w-full sm:w-auto sm:min-w-[200px] sm:max-w-md sm:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={tu('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="min-w-0 flex-1 sm:w-[180px] sm:flex-none" aria-label={tu('columns.status')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tu('filters.allStatuses')}</SelectItem>
            <SelectItem value="active">{tu('status.active')}</SelectItem>
            <SelectItem value="unconfirmed">{tu('stats.unconfirmed')}</SelectItem>
            <SelectItem value="suspended">{tu('status.suspended')}</SelectItem>
            <SelectItem value="banned">{tu('status.banned')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
          <SelectTrigger className="min-w-0 flex-1 sm:w-[160px] sm:flex-none" aria-label={tu('columns.role')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tu('filters.allRoles')}</SelectItem>
            <SelectItem value="admin">{tu('roles.admin')}</SelectItem>
            <SelectItem value="curator">{tu('roles.curator')}</SelectItem>
            <SelectItem value="contributor">{tu('roles.contributor')}</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={loadUsers} variant="outline" disabled={loading} aria-label={t('refresh')} title={t('refresh')}>
          <RefreshCw className={cn('h-4 w-4 sm:mr-2', loading && 'animate-spin')} />
          <span className="hidden sm:inline">{t('refresh')}</span>
        </Button>
      </div>

      {notice && (
        <div
          role="status"
          className={cn(
            'mb-4 flex items-center justify-between gap-3 rounded-md border px-4 py-2 text-sm',
            notice.kind === 'success'
              ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
              : 'border-destructive/40 bg-destructive/5 text-destructive',
          )}
        >
          {notice.text}
          <button type="button" onClick={() => setNotice(null)} aria-label={tu('moderation.cancel')}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <p className="mb-3 text-sm text-muted-foreground">
        {tu('showing', { shown: filtered.length, total: users.length })}
      </p>

      {loadError ? (
        <p className="text-sm text-destructive">{loadError}</p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-3 sm:px-4">{tu('columns.user')}</TableHead>
                <TableHead className="hidden sm:table-cell">{tu('columns.role')}</TableHead>
                <TableHead className="hidden sm:table-cell">{tu('columns.status')}</TableHead>
                <TableHead className="hidden xl:table-cell">{tu('columns.activity')}</TableHead>
                <TableHead className="hidden whitespace-nowrap 2xl:table-cell">{tu('columns.created')}</TableHead>
                <TableHead className="hidden whitespace-nowrap lg:table-cell">{tu('columns.lastSignIn')}</TableHead>
                <TableHead className="w-12 text-right">
                  <span className="sr-only">{tu('columns.actions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    {tu('empty')}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => {
                  const confirmed = !!u.email_confirmed_at
                  const isSelf = u.id === user?.id
                  const protectedUser = isSelf || u.role === 'admin'
                  const blocked = u.account_status !== 'active'
                  const statusBadges = (
                    <>
                      {u.account_status === 'banned' ? (
                        <Badge variant="destructive">
                          <Ban className="mr-1 h-3 w-3" />
                          {tu('status.banned')}
                        </Badge>
                      ) : u.account_status === 'suspended' ? (
                        <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                          <Clock className="mr-1 h-3 w-3" />
                          {tu('status.suspended')}
                        </Badge>
                      ) : confirmed ? (
                        <Badge variant="outline" className="border-green-300 text-green-700 dark:text-green-400">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          {tu('status.active')}
                        </Badge>
                      ) : null}
                      {u.content_hidden && (
                        <Badge variant="outline" className="text-muted-foreground">
                          <EyeOff className="mr-1 h-3 w-3" />
                          {tu('contentHidden')}
                        </Badge>
                      )}
                      {!confirmed && (
                        <Badge variant="outline" className="border-sky-300 text-sky-700 dark:text-sky-400">
                          <Mail className="mr-1 h-3 w-3" />
                          {tu('pending')}
                        </Badge>
                      )}
                    </>
                  )
                  return (
                    <TableRow key={u.id} className={cn(blocked && 'bg-muted/40')}>
                      {/* w-full + max-w-0: the user column takes the free space and truncates */}
                      <TableCell className="w-full max-w-0 px-3 sm:px-4">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.avatar_url}
                              alt=""
                              referrerPolicy="no-referrer"
                              className={cn('h-9 w-9 shrink-0 rounded-full object-cover', blocked && 'grayscale')}
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                              {initials(u)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 font-medium">
                              <span className="truncate">{u.full_name || '—'}</span>
                              {isSelf && (
                                <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                                  {tu('you')}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <span className="truncate">{u.email}</span>
                              {u.provider === 'google' && (
                                <span className="rounded border px-1 text-[10px] uppercase">Google</span>
                              )}
                            </div>
                            {/* Phones: role and status under the name instead of their own columns */}
                            <div className="mt-1.5 flex flex-wrap items-center gap-1 sm:hidden">
                              <RoleChip role={u.role} label={tu(`roles.${u.role}`)} />
                              {statusBadges}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="hidden sm:table-cell">
                        <RoleChip role={u.role} label={tu(`roles.${u.role}`)} />
                      </TableCell>

                      <TableCell className="hidden sm:table-cell">
                        <div className="flex max-w-[260px] flex-col items-start gap-1">
                          {statusBadges}
                          {u.account_status === 'suspended' && u.suspended_until && (
                            <span className="text-xs text-muted-foreground" title={fullDate(u.suspended_until)}>
                              {tu('endsIn', { when: ago(u.suspended_until) })}
                            </span>
                          )}
                          {blocked && u.moderation_reason && (
                            <span className="line-clamp-2 text-xs text-muted-foreground" title={u.moderation_reason}>
                              “{u.moderation_reason}”
                            </span>
                          )}
                          {!confirmed && u.confirmation_sent_at && (
                            <span className="text-xs text-muted-foreground">
                              {tu('lastSent', { when: ago(u.confirmation_sent_at) })}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="hidden xl:table-cell">
                        <div className="flex items-center gap-3 text-sm tabular-nums text-muted-foreground">
                          <span className="flex items-center gap-1" title={tu('routesCount', { count: u.routes_count })}>
                            <RouteIcon className="h-3.5 w-3.5" />
                            {u.routes_count}
                          </span>
                          <span className="flex items-center gap-1" title={tu('commentsCount', { count: u.comments_count })}>
                            <MessageSquare className="h-3.5 w-3.5" />
                            {u.comments_count}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="hidden whitespace-nowrap text-sm 2xl:table-cell" title={fullDate(u.created_at)}>
                        {ago(u.created_at)}
                      </TableCell>
                      <TableCell className="hidden whitespace-nowrap text-sm lg:table-cell" title={fullDate(u.last_sign_in_at)}>
                        {u.last_sign_in_at ? ago(u.last_sign_in_at) : tu('never')}
                      </TableCell>

                      <TableCell className="px-2 text-right sm:px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={busy === u.id}
                              aria-label={tu('columns.actions')}
                            >
                              {busy === u.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="truncate">{nameOf(u)}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {!confirmed && (
                              <DropdownMenuItem onSelect={() => handleResend(u)}>
                                <Mail className="mr-2 h-4 w-4" />
                                {tu('resend')}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onSelect={() => handleCopy(u)}>
                              <Copy className="mr-2 h-4 w-4" />
                              {tu('actions.copyEmail')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setHistory(u)}>
                              <History className="mr-2 h-4 w-4" />
                              {tu('actions.history')}
                            </DropdownMenuItem>
                            {!protectedUser && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onSelect={() => {
                                    setRoleChoice(u.role === 'curator' ? 'curator' : 'contributor')
                                    setRoleTarget(u)
                                  }}
                                >
                                  <UserCog className="mr-2 h-4 w-4" />
                                  {tu('actions.changeRole')}
                                </DropdownMenuItem>
                                {blocked ? (
                                  <DropdownMenuItem onSelect={() => setReactivate(u)}>
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    {tu('actions.reactivate')}
                                  </DropdownMenuItem>
                                ) : null}
                                {u.account_status === 'banned' && (
                                  <DropdownMenuItem onSelect={() => handleContentHidden(u, !u.content_hidden)}>
                                    {u.content_hidden ? (
                                      <Eye className="mr-2 h-4 w-4" />
                                    ) : (
                                      <EyeOff className="mr-2 h-4 w-4" />
                                    )}
                                    {u.content_hidden ? tu('actions.showContent') : tu('actions.hideContent')}
                                  </DropdownMenuItem>
                                )}
                                {u.account_status !== 'banned' && (
                                  <DropdownMenuItem
                                    onSelect={() => setModerate({ user: u, mode: 'suspend' })}
                                    className="text-amber-700 focus:text-amber-800 dark:text-amber-400"
                                  >
                                    <Clock className="mr-2 h-4 w-4" />
                                    {u.account_status === 'suspended' ? tu('actions.changeSuspension') : tu('actions.suspend')}
                                  </DropdownMenuItem>
                                )}
                                {u.account_status !== 'banned' && (
                                  <DropdownMenuItem
                                    onSelect={() => setModerate({ user: u, mode: 'ban' })}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Ban className="mr-2 h-4 w-4" />
                                    {tu('actions.ban')}
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <UserModerationDialog
        user={moderate?.user ?? null}
        mode={moderate?.mode ?? 'suspend'}
        onClose={() => setModerate(null)}
        onConfirm={handleModerate}
      />

      <UserHistoryDialog user={history} onClose={() => setHistory(null)} />

      {/* Change role: contributor or curator (admins are set in the database) */}
      <Dialog open={!!roleTarget} onOpenChange={(o) => !o && setRoleTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-sans normal-case tracking-normal">{tu('roleDialog.title')}</DialogTitle>
            <DialogDescription>{roleTarget && tu('roleDialog.description', { name: nameOf(roleTarget) })}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2" role="radiogroup" aria-label={tu('columns.role')}>
            {(['contributor', 'curator'] as const).map((r) => (
              <label
                key={r}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50',
                  roleChoice === r && 'border-primary bg-primary/5',
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={roleChoice === r}
                  onChange={() => setRoleChoice(r)}
                  className="mt-1 accent-[hsl(var(--primary))]"
                />
                <span>
                  <span className="block text-sm font-medium">{tu(`roles.${r}`)}</span>
                  <span className="block text-xs text-muted-foreground">{tu(`roleDialog.${r}Help`)}</span>
                </span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleTarget(null)}>
              {tu('moderation.cancel')}
            </Button>
            <Button
              disabled={!roleTarget || roleChoice === roleTarget.role || busy === roleTarget.id}
              onClick={() => {
                if (roleTarget) handleRoleChange(roleTarget, roleChoice)
                setRoleTarget(null)
              }}
            >
              {tu('roleDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!reactivate} onOpenChange={(open) => !open && setReactivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tu('reactivateDialog.title', { name: reactivate ? nameOf(reactivate) : '' })}
            </AlertDialogTitle>
            <AlertDialogDescription>{tu('reactivateDialog.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tu('moderation.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (reactivate) handleReactivate(reactivate)
                setReactivate(null)
              }}
            >
              {tu('actions.reactivate')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const ROLE_STYLE: Record<string, string> = {
  admin: 'border-primary/40 bg-primary/10 text-primary',
  curator: 'border-sky-400/40 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  contributor: 'border-border bg-muted text-muted-foreground',
}

function RoleChip({ role, label }: { role: string; label: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium', ROLE_STYLE[role] ?? ROLE_STYLE.contributor)}>
      {role === 'admin' && <ShieldCheck className="h-3 w-3" />}
      {label}
    </span>
  )
}
