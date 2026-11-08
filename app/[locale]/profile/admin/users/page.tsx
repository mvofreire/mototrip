'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import { de, enUS, es, fr, pt } from 'date-fns/locale'
import { CheckCircle2, Clock, Loader2, Mail, RefreshCw, Search } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { AdminService, AdminUser } from '@/lib/services/admin.service'
import { AdminNav } from '@/components/admin/admin-nav'
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

const dateLocales = { pt, en: enUS, es, fr, de } as const

type ResendState = { status: 'sending' } | { status: 'sent' } | { status: 'error'; message: string }

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
  const [onlyPending, setOnlyPending] = useState(false)
  const [resend, setResend] = useState<Record<string, ResendState>>({})

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

  const pendingCount = users.filter((u) => !u.email_confirmed_at).length

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter(
      (u) =>
        (!onlyPending || !u.email_confirmed_at) &&
        (!q ||
          u.email.toLowerCase().includes(q) ||
          (u.full_name ?? '').toLowerCase().includes(q)),
    )
  }, [users, search, onlyPending])

  const handleResend = async (u: AdminUser) => {
    setResend((s) => ({ ...s, [u.id]: { status: 'sending' } }))
    try {
      await AdminService.resendConfirmation(u.email)
      setResend((s) => ({ ...s, [u.id]: { status: 'sent' } }))
    } catch (e) {
      setResend((s) => ({
        ...s,
        [u.id]: { status: 'error', message: (e as Error).message || tu('resendError') },
      }))
    }
  }

  const ago = (date: string | null) =>
    date
      ? formatDistanceToNow(new Date(date), {
          addSuffix: true,
          locale: dateLocales[locale as keyof typeof dateLocales] ?? enUS,
        })
      : '—'

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{t('pageTitle')}</h1>
        <p className="text-muted-foreground">{tu('description')}</p>
      </div>

      <AdminNav />

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative max-w-md flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={tu('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={onlyPending ? 'default' : 'outline'}
          onClick={() => setOnlyPending((v) => !v)}
        >
          <Clock className="mr-2 h-4 w-4" />
          {tu('onlyPending', { count: pendingCount })}
        </Button>
        <Button onClick={loadUsers} variant="outline" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {t('refresh')}
        </Button>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {tu('total', { count: users.length, pending: pendingCount })}
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
                <TableHead>{tu('columns.created')}</TableHead>
                <TableHead>{tu('columns.lastSignIn')}</TableHead>
                <TableHead className="text-right">{tu('columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    {tu('empty')}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => {
                  const confirmed = !!u.email_confirmed_at
                  const state = resend[u.id]
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="font-medium">{u.full_name || '—'}</div>
                        <div className="text-sm text-muted-foreground">{u.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                          {tu(`roles.${u.role}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {confirmed ? (
                          <Badge variant="outline" className="border-green-300 text-green-700">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            {tu('confirmed')}
                          </Badge>
                        ) : (
                          <div className="space-y-1">
                            <Badge variant="outline" className="border-amber-300 text-amber-700">
                              <Clock className="mr-1 h-3 w-3" />
                              {tu('pending')}
                            </Badge>
                            {u.confirmation_sent_at && (
                              <div className="text-xs text-muted-foreground">
                                {tu('lastSent', { when: ago(u.confirmation_sent_at) })}
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{ago(u.created_at)}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {u.last_sign_in_at ? ago(u.last_sign_in_at) : tu('never')}
                      </TableCell>
                      <TableCell className="text-right">
                        {!confirmed && (
                          <div className="flex flex-col items-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResend(u)}
                              disabled={state?.status === 'sending'}
                            >
                              {state?.status === 'sending' ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : state?.status === 'sent' ? (
                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                              ) : (
                                <Mail className="mr-2 h-4 w-4" />
                              )}
                              {state?.status === 'sent' ? tu('resent') : tu('resend')}
                            </Button>
                            {state?.status === 'error' && (
                              <span className="max-w-[220px] text-xs text-destructive">
                                {state.message}
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
