'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { RefreshCw, Search } from 'lucide-react'
import { AdminService, AdminRouteWithUser } from '@/lib/services/admin.service'
import { AdminRoutesTable } from '@/components/admin/admin-routes-table'
import { AdminRouteDrawer } from '@/components/admin/admin-route-drawer'
import { AdminPageHeader, useAdmin } from '@/components/admin/admin-shell'
import { FilterChip } from '@/components/admin/filter-chip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { RouteStatus } from '@/types/database.types'
import { cn } from '@/lib/utils'

type StatusFilter = RouteStatus | 'all'
const FILTERS: StatusFilter[] = ['all', 'pending', 'approved', 'rejected']

/** MotoTrip review filter, to find routes that need a (better) review */
type CuratorFilter = 'any' | 'missing' | 'low'
const CURATOR_FILTERS: CuratorFilter[] = ['any', 'missing', 'low']
const matchesCurator = (r: AdminRouteWithUser, f: CuratorFilter) =>
  f === 'any' || (f === 'missing' ? r.curator_rating == null : r.curator_confidence === 'low')

export default function AdminRoutesPage() {
  // useSearchParams needs a Suspense boundary
  return (
    <Suspense>
      <RoutesView />
    </Suspense>
  )
}

function RoutesView() {
  const t = useTranslations('admin')
  const tStatus = useTranslations('routeStatus')
  const { isAdmin, refreshPending } = useAdmin()
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [routes, setRoutes] = useState<AdminRouteWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const statusParam = params.get('status') as StatusFilter | null
  const statusFilter: StatusFilter = statusParam && FILTERS.includes(statusParam) ? statusParam : 'all'
  const [curatorFilter, setCuratorFilter] = useState<CuratorFilter>('any')
  const openId = params.get('route')

  /** Filters and the open route live in the URL, so links (dashboard, emails) can point at them */
  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    const qs = next.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  const loadRoutes = useCallback(async () => {
    setLoading(true)
    try {
      setRoutes(await AdminService.getAllRoutes({ withEmails: isAdmin }))
    } catch (error) {
      console.error('Error loading routes:', error)
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    loadRoutes()
  }, [loadRoutes])

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = { pending: 0, approved: 0, rejected: 0, all: routes.length }
    routes.forEach((r) => c[r.status]++)
    return c
  }, [routes])

  const filteredRoutes = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return routes
      .filter((r) => statusFilter === 'all' || r.status === statusFilter)
      .filter((r) => matchesCurator(r, curatorFilter))
      .filter(
        (r) =>
          !q ||
          r.title.toLowerCase().includes(q) ||
          r.user_email?.toLowerCase().includes(q) ||
          r.user_name?.toLowerCase().includes(q) ||
          r.region?.toLowerCase().includes(q) ||
          r.country?.toLowerCase().includes(q),
      )
      // Oldest pending first, otherwise most recently updated first
      .sort((a, b) =>
        statusFilter === 'pending' ? a.updated_at.localeCompare(b.updated_at) : b.updated_at.localeCompare(a.updated_at),
      )
  }, [routes, searchTerm, statusFilter, curatorFilter])

  const curatorCounts = useMemo(() => {
    const inStatus = routes.filter((r) => statusFilter === 'all' || r.status === statusFilter)
    return Object.fromEntries(CURATOR_FILTERS.map((f) => [f, inStatus.filter((r) => matchesCurator(r, f)).length])) as Record<
      CuratorFilter,
      number
    >
  }, [routes, statusFilter])

  const patch = (id: string, updated: Partial<AdminRouteWithUser>) =>
    setRoutes((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)))

  const handleApprove = async (id: string) => {
    try {
      patch(id, await AdminService.approveRoute(id))
      refreshPending()
    } catch (error) {
      console.error('Error approving route:', error)
      alert(t('errorUpdate'))
    }
  }

  const handleApproveBulk = async (ids: string[]) => {
    try {
      const updated = await Promise.all(ids.map((id) => AdminService.approveRoute(id)))
      updated.forEach((u) => patch(u.id, u))
      refreshPending()
    } catch (error) {
      console.error('Error approving routes:', error)
      alert(t('errorUpdate'))
      loadRoutes()
    }
  }

  const handleReject = async (id: string, note: string) => {
    try {
      patch(id, await AdminService.rejectRoute(id, note))
      refreshPending()
    } catch (error) {
      console.error('Error rejecting route:', error)
      alert(t('errorUpdate'))
    }
  }

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      patch(id, await AdminService.toggleFeatured(id, featured))
    } catch (error) {
      console.error('Error toggling featured status:', error)
      alert(t('errorToggleFeatured'))
    }
  }

  const handleFeatureBulk = async (ids: string[], featured: boolean) => {
    try {
      const updated = await Promise.all(ids.map((id) => AdminService.toggleFeatured(id, featured)))
      updated.forEach((u) => patch(u.id, u))
    } catch (error) {
      console.error('Error featuring routes:', error)
      alert(t('errorToggleFeatured'))
      loadRoutes()
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await AdminService.deleteRoute(id)
      setRoutes((prev) => prev.filter((route) => route.id !== id))
      if (openId === id) setParam('route', null)
      refreshPending()
    } catch (error) {
      console.error('Error deleting route:', error)
      alert(t('errorDelete'))
    }
  }

  const handleDeleteBulk = async (ids: string[]) => {
    try {
      await AdminService.deleteRoutesBulk(ids)
      setRoutes((prev) => prev.filter((route) => !ids.includes(route.id)))
      refreshPending()
    } catch (error) {
      console.error('Error deleting routes:', error)
      alert(t('errorDeleteBulk'))
    }
  }

  const open = routes.find((r) => r.id === openId) ?? null

  return (
    <div>
      <AdminPageHeader title={t('shell.routes')} description={t('pageDescription')}>
        <Button onClick={loadRoutes} variant="outline" disabled={loading}>
          <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
          {t('refresh')}
        </Button>
      </AdminPageHeader>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <FilterChip
            key={f}
            active={statusFilter === f}
            attention={f === 'pending' && counts.pending > 0}
            count={counts[f]}
            onClick={() => setParam('status', f === 'all' ? null : f)}
          >
            {f === 'all' ? t('review.all') : tStatus(f)}
          </FilterChip>
        ))}
        <div className="relative ml-auto w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t('searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium text-muted-foreground">{t('curatorFilter.label')}:</span>
        {CURATOR_FILTERS.map((f) => (
          <FilterChip key={f} size="sm" active={curatorFilter === f} count={curatorCounts[f]} onClick={() => setCuratorFilter(f)}>
            {t(`curatorFilter.${f}`)}
          </FilterChip>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{t('totalRoutes', { count: filteredRoutes.length })}</span>
      </div>

      {loading && routes.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <AdminRoutesTable
          routes={filteredRoutes}
          canDelete={isAdmin}
          onOpen={(id) => setParam('route', id)}
          onApprove={handleApprove}
          onApproveBulk={handleApproveBulk}
          onReject={handleReject}
          onToggleFeatured={handleToggleFeatured}
          onFeatureBulk={handleFeatureBulk}
          onDelete={handleDelete}
          onDeleteBulk={handleDeleteBulk}
        />
      )}

      <AdminRouteDrawer
        route={open}
        canDelete={isAdmin}
        onClose={() => setParam('route', null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onToggleFeatured={handleToggleFeatured}
        onDelete={handleDelete}
      />
    </div>
  )
}
