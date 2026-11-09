'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { AdminService, AdminUser, AccountStatus } from '@/lib/services/admin.service'
import { AdminNav } from '@/components/admin/admin-nav'
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
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('admin')
  const tu = useTranslations('admin.users')

  const [isAdmin, setIsAdmin] = useState(false)
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

  useEffect(() => {
    const init = async () => {
      if (authLoading) return
      if (!user) {
        router.push(
          `/${locale}/auth/login?redirect=${encodeURIComponent(`/${locale}/profile/admin/users`)}`,
        )
        return
      }
      const admin = await AdminService.isAdmin()
      setIsAdmin(admin)
      if (!admin) {
        router.push(`/${locale}/profile`)
        return
      }
      await loadUsers()
    }
    init()
  }, [user, authLoading, router, locale, loadUsers])

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

  if (authLoading || (loading && !isAdmin)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!isAdmin) return null

  const stats: { key: StatusFilter; label: string; value: number; icon: typeof Users; tone: string }[] = [
    { key: 'all', label: tu('stats.all'), value: counts.all, icon: Users, tone: 'text-foreground' },
    { key: 'active', label: tu('stats.active'), value: counts.active, icon: UserCheck, tone: 'text-green-600' },
    { key: 'unconfirmed', label: tu('stats.unconfirmed'), value: counts.unconfirmed, icon: Mail, tone: 'text-sky-600' },
    { key: 'suspended', label: tu('stats.suspended'), value: counts.suspended, icon: Clock, tone: 'text-amber-600' },
    { key: 'banned', label: tu('stats.banned'), value: counts.banned, icon: Ban, tone: 'text-destructive' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{t('pageTitle')}</h1>
        <p className="text-muted-foreground">{tu('description')}</p>
      </div>

      <AdminNav />

      {/* Stats double as status filters */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ key, label, value, icon: Icon, tone }) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            aria-pressed={statusFilter === key}
            className={cn(
              'rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent',
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

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={tu('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[180px]" aria-label={tu('columns.status')}>
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
          <SelectTrigger className="w-[160px]" aria-label={tu('columns.role')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tu('filters.allRoles')}</SelectItem>
            <SelectItem value="admin">{tu('roles.admin')}</SelectItem>
            <SelectItem value="curator">{tu('roles.curator')}</SelectItem>
            <SelectItem value="contributor">{tu('roles.contributor')}</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={loadUsers} variant="outline" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {t('refresh')}
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
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tu('columns.user')}</TableHead>
                <TableHead>{tu('columns.role')}</TableHead>
                <TableHead>{tu('columns.status')}</TableHead>
                <TableHead>{tu('columns.activity')}</TableHead>
                <TableHead>{tu('columns.created')}</TableHead>
                <TableHead>{tu('columns.lastSignIn')}</TableHead>
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
                  return (
                    <TableRow key={u.id} className={cn(blocked && 'bg-muted/40')}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.avatar_url}
                              alt=""
                              referrerPolicy="no-referrer"
                              className={cn('h-9 w-9 rounded-full object-cover', blocked && 'grayscale')}
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
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
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {u.role === 'admin' ? (
                          <Badge>
                            <ShieldCheck className="mr-1 h-3 w-3" />
                            {tu('roles.admin')}
                          </Badge>
                        ) : (
                          <Select
                            value={u.role}
                            disabled={busy === u.id}
                            onValueChange={(v) => handleRoleChange(u, v as 'contributor' | 'curator')}
                          >
                            <SelectTrigger className="h-8 w-[140px]" aria-label={tu('columns.role')}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="contributor">{tu('roles.contributor')}</SelectItem>
                              <SelectItem value="curator">{tu('roles.curator')}</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex max-w-[260px] flex-col items-start gap-1">
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

                      <TableCell>
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

                      <TableCell className="whitespace-nowrap text-sm" title={fullDate(u.created_at)}>
                        {ago(u.created_at)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm" title={fullDate(u.last_sign_in_at)}>
                        {u.last_sign_in_at ? ago(u.last_sign_in_at) : tu('never')}
                      </TableCell>

                      <TableCell className="text-right">
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
