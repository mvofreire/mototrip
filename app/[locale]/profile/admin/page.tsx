'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowRight, Check, CheckCircle2, Clock, FileText, Loader2, Map as MapIcon, RefreshCw, Users, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { de, enUS, es, fr, ptBR } from 'date-fns/locale'
import { AdminPageHeader, useAdmin } from '@/components/admin/admin-shell'
import { ChartCard, HBars, Legend, LineChart, SERIES, SegmentBar, StackedColumns } from '@/components/admin/charts'
import { Button } from '@/components/ui/button'
import { AdminService, type DashboardData } from '@/lib/services/admin.service'
import { BlogAdminService } from '@/lib/services/blog-admin.service'
import { seoChecks } from '@/lib/blog/seo'
import { pickTranslation, type BlogPost } from '@/lib/blog/posts'
import { cn } from '@/lib/utils'

const dateLocales = { pt: ptBR, en: enUS, es, fr, de } as const
const RANGES = [7, 30, 90] as const
const CATEGORIES = ['scenic', 'mountain', 'coastal', 'weekend', 'adventure'] as const
const DAY = 86400000

/** YYYY-MM-DD in local time */
const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** Counts per day for the last `days` days, oldest first */
function perDay(dates: string[], days: number) {
  const counts = new Map<string, number>()
  dates.forEach((iso) => {
    const k = dayKey(new Date(iso))
    counts.set(k, (counts.get(k) ?? 0) + 1)
  })
  const today = new Date()
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today.getTime() - (days - 1 - i) * DAY)
    return { date: d, value: counts.get(dayKey(d)) ?? 0 }
  })
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

export default function AdminDashboardPage() {
  const locale = useLocale()
  const t = useTranslations('admin.dashboard')
  const tAll = useTranslations()
  const { refreshPending } = useAdmin()
  const [data, setData] = useState<DashboardData | null>(null)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [range, setRange] = useState<(typeof RANGES)[number]>(30)
  const [approving, setApproving] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [d, p] = await Promise.all([AdminService.getDashboardData(180), BlogAdminService.listPosts()])
      setData(d)
      setPosts(p)
    } catch (e) {
      console.error('Error loading dashboard:', e)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    load()
  }, [load])

  const view = useMemo(() => {
    if (!data) return null
    const now = Date.now()
    const inRange = (iso: string, days: number, offset = 0) => {
      const age = now - new Date(iso).getTime()
      return age >= offset * DAY && age < (offset + days) * DAY
    }
    const created = data.routes.map((r) => r.created_at)
    const signupsSeries = perDay(data.signups, range)
    const routesSeries = perDay(created, range)
    const fmtDay = new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' })
    const delta = (dates: string[]) => {
      const cur = dates.filter((d) => inRange(d, range)).length
      const prev = dates.filter((d) => inRange(d, range, range)).length
      return { cur, pct: prev ? Math.round(((cur - prev) / prev) * 100) : null }
    }
    const status = { approved: 0, pending: 0, rejected: 0 }
    data.routes.forEach((r) => status[r.status]++)
    const pending = data.routes.filter((r) => r.status === 'pending').sort((a, b) => a.created_at.localeCompare(b.created_at))

    const countries = new Map<string, number>()
    data.routes
      .filter((r) => r.status === 'approved')
      .forEach((r) => countries.set(r.country || '—', (countries.get(r.country || '—') ?? 0) + 1))

    // Last 6 calendar months, by category
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date()
      d.setDate(1)
      d.setMonth(d.getMonth() - (5 - i))
      return d
    })
    const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`
    const byCat = CATEGORIES.map((c, k) => ({
      name: tAll(`categories.${c}`),
      color: SERIES[k],
      data: months.map((m) => data.routes.filter((r) => r.category === c && monthKey(new Date(r.created_at)) === monthKey(m)).length),
    }))

    const published = posts.filter((p) => p.status === 'published')
    const weakSeo = published.filter((p) => {
      const tr = p.translations.find((x) => x.locale === 'pt') ?? p.translations[0]
      return !tr || seoChecks(tr, p.slug).score < 60
    })

    return {
      labels: signupsSeries.map((d) => fmtDay.format(d.date)),
      signups: signupsSeries.map((d) => d.value),
      submitted: routesSeries.map((d) => d.value),
      signupDelta: delta(data.signups),
      routeDelta: delta(created),
      status,
      pending,
      countries: Array.from(countries, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 6),
      months: months.map((m) => new Intl.DateTimeFormat(locale, { month: 'short' }).format(m)),
      byCat,
      blog: { published: published.length, drafts: posts.filter((p) => p.status === 'draft').length, weakSeo },
    }
  }, [data, posts, range, locale, tAll])

  const approve = async (id: string) => {
    setApproving(id)
    try {
      await AdminService.approveRoute(id)
      setData((d) => d && { ...d, routes: d.routes.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)) })
      refreshPending()
    } catch (e) {
      console.error(e)
      alert(tAll('admin.errorUpdate'))
    } finally {
      setApproving(null)
    }
  }

  const base = `/${locale}/profile/admin`
  const dateLocale = dateLocales[locale as keyof typeof dateLocales] ?? enUS

  if (loading && !view) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (error || !view || !data) {
    return (
      <div className="rounded-xl border p-10 text-center text-muted-foreground">
        <p className="mb-4">{t('error')}</p>
        <Button variant="outline" onClick={load}>{t('retry')}</Button>
      </div>
    )
  }

  const Delta = ({ pct }: { pct: number | null }) =>
    pct == null ? null : (
      <span className={cn('text-xs font-semibold', pct >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
        {pct >= 0 ? '▲' : '▼'} {Math.abs(pct)}% <span className="font-normal text-muted-foreground">{t('vsPrevious', { days: range })}</span>
      </span>
    )

  const kpi = (icon: React.ReactNode, label: string, value: number | string, extra: React.ReactNode, spark?: number[], className?: string) => (
    <div className={cn('flex min-w-0 flex-col gap-1 rounded-xl border bg-card p-3 sm:p-4', className)}>
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-display text-3xl font-extrabold tabular-nums leading-none">{value}</span>
      {extra}
      {spark && (
        <div className="mt-auto pt-2">
          <LineChart labels={view.labels} series={[{ name: label, data: spark, color: 'hsl(var(--primary))' }]} height={32} bare />
        </div>
      )}
    </div>
  )

  const oldest = view.pending[0]

  return (
    <div className="space-y-4">
      <AdminPageHeader title={t('title')} description={t('description')}>
        <div className="inline-flex rounded-lg border bg-muted/50 p-0.5" role="group" aria-label={t('period')}>
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={range === r}
              onClick={() => setRange(r)}
              className={cn('rounded-md px-3 py-1 text-sm font-medium', range === r ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}
            >
              {t('days', { n: r })}
            </button>
          ))}
        </div>
        <Button variant="outline" size="icon" onClick={load} disabled={loading} aria-label={t('refresh')} title={t('refresh')}>
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </Button>
      </AdminPageHeader>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpi(<Users className="h-3.5 w-3.5" />, t('kpi.users'), data.totalUsers.toLocaleString(locale),
          <span className="text-xs text-muted-foreground">{t('kpi.newUsers', { n: view.signupDelta.cur })} <Delta pct={view.signupDelta.pct} /></span>, view.signups)}
        {kpi(<MapIcon className="h-3.5 w-3.5" />, t('kpi.routes'), view.status.approved.toLocaleString(locale),
          <span className="text-xs text-muted-foreground">{t('kpi.submitted', { n: view.routeDelta.cur })} <Delta pct={view.routeDelta.pct} /></span>, view.submitted)}
        {kpi(<FileText className="h-3.5 w-3.5" />, t('kpi.posts'), view.blog.published,
          <span className="text-xs text-muted-foreground">
            {t('kpi.drafts', { n: view.blog.drafts })}
            {view.blog.weakSeo.length > 0 && <> · <Link href={`${base}/blog`} className="font-medium text-amber-700 hover:underline dark:text-amber-400">{t('kpi.weakSeo', { n: view.blog.weakSeo.length })}</Link></>}
          </span>)}
        {kpi(<Clock className="h-3.5 w-3.5" />, t('kpi.pending'), view.status.pending,
          <>
            <span className="text-xs text-muted-foreground">
              {oldest ? t('kpi.oldest', { time: formatDistanceToNow(new Date(oldest.created_at), { locale: dateLocale }) }) : t('kpi.noneWaiting')}
            </span>
            {view.status.pending > 0 && (
              <Button asChild size="sm" variant="outline" className="mt-auto w-full px-2 sm:w-auto sm:self-start sm:px-3">
                <Link href={`${base}/routes?status=pending`}>{t('reviewNow')} <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            )}
          </>, undefined, view.status.pending > 0 ? 'border-amber-400/70' : undefined)}
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ChartCard title={t('activity')} hint={t('days', { n: range })}>
          <LineChart
            labels={view.labels}
            series={[
              { name: t('series.signups'), data: view.signups, color: SERIES[0] },
              { name: t('series.submitted'), data: view.submitted, color: SERIES[1] },
            ]}
          />
          <Legend items={[{ label: t('series.signups'), color: SERIES[0], value: sum(view.signups) }, { label: t('series.submitted'), color: SERIES[1], value: sum(view.submitted) }]} />
        </ChartCard>

        <ChartCard
          title={t('queue')}
          actions={<Link href={`${base}/routes?status=pending`} className="text-xs font-medium text-muted-foreground hover:text-foreground">{t('seeAll')}</Link>}
        >
          {view.pending.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t('queueEmpty')}</p>
          ) : (
            <ul className="divide-y">
              {view.pending.slice(0, 6).map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-2">
                  <div className="h-9 w-12 shrink-0 overflow-hidden rounded border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {r.thumbnail_url && <img src={r.thumbnail_url} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`${base}/routes?status=pending&route=${r.id}`} className="block truncate text-sm font-medium hover:underline">{r.title}</Link>
                    <span className="text-xs text-muted-foreground">
                      {[r.country, formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: dateLocale })].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" title={t('approve')} aria-label={t('approve')} disabled={approving === r.id} onClick={() => approve(r.id)}>
                    {approving === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <ChartCard title={t('byStatus')}>
          <SegmentBar
            segments={[
              { label: tAll('routeStatus.approved'), value: view.status.approved, color: '#0ca30c', icon: <CheckCircle2 className="h-3 w-3" /> },
              { label: tAll('routeStatus.pending'), value: view.status.pending, color: '#fab219', icon: <Clock className="h-3 w-3" /> },
              { label: tAll('routeStatus.rejected'), value: view.status.rejected, color: '#d03b3b', icon: <XCircle className="h-3 w-3" /> },
            ]}
          />
        </ChartCard>
        <ChartCard title={t('byCountry')} hint={t('approvedOnly')}>
          {view.countries.length ? <HBars data={view.countries} /> : <p className="text-sm text-muted-foreground">—</p>}
        </ChartCard>
        <ChartCard title={t('byCategory')} hint={t('lastMonths')} className="md:col-span-2 xl:col-span-1">
          <StackedColumns labels={view.months} groups={view.byCat} totalLabel={(n) => t('routesCount', { n })} />
          <Legend items={view.byCat.map((g) => ({ label: g.name, color: g.color }))} />
        </ChartCard>
      </div>

      {view.blog.weakSeo.length > 0 && (
        <ChartCard title={t('seoTodo')} hint={t('seoTodoHint')}>
          <ul className="divide-y">
            {view.blog.weakSeo.slice(0, 5).map((p) => {
              const tr = pickTranslation(p, locale)
              return (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0 truncate">{tr?.title ?? p.slug}</span>
                  <Link href={`${base}/blog/${p.id}?tab=seo`} className="shrink-0 text-xs font-medium text-primary hover:underline">{t('fixSeo')}</Link>
                </li>
              )
            })}
          </ul>
        </ChartCard>
      )}
    </div>
  )
}
