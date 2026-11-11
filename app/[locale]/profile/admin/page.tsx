'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/use-auth'
import { AdminService, AdminRouteWithUser } from '@/lib/services/admin.service'
import { AdminRoutesTable } from '@/components/admin/admin-routes-table'
import { AdminNav } from '@/components/admin/admin-nav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RefreshCw, Search } from 'lucide-react'
import type { UserRole } from '@/types/auth.types'
import type { RouteStatus } from '@/types/database.types'
import { cn } from '@/lib/utils'

type StatusFilter = RouteStatus | 'all'
const FILTERS: StatusFilter[] = [ 'all', 'pending', 'rejected', 'approved']

/** MotoTrip review filter, to find routes that need a (better) review */
type CuratorFilter = 'any' | 'missing' | 'low'
const CURATOR_FILTERS: CuratorFilter[] = ['any', 'missing', 'low']
const matchesCurator = (r: AdminRouteWithUser, f: CuratorFilter) =>
  f === 'any' || (f === 'missing' ? r.curator_rating == null : r.curator_confidence === 'low')

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('admin')
  const tStatus = useTranslations('routeStatus')
  const [role, setRole] = useState<UserRole | null>(null)
  const [routes, setRoutes] = useState<AdminRouteWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [curatorFilter, setCuratorFilter] = useState<CuratorFilter>('any')

  const isAdmin = role === 'admin'
  const isStaff = role === 'admin' || role === 'curator'

  const loadRoutes = useCallback(async (asAdmin: boolean) => {
    setLoading(true)
    try {
      setRoutes(await AdminService.getAllRoutes({ withEmails: asAdmin }))
    } catch (error) {
      console.error('Error loading routes:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      if (authLoading) return
      if (!user) {
        router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(`/${locale}/profile/admin`)}`)
        return
      }
      const r = await AdminService.getRole()
      setRole(r)
      if (r !== 'admin' && r !== 'curator') {
        router.push(`/${locale}/profile`)
        return
      }
      await loadRoutes(r === 'admin')
    }
    init()
  }, [user, authLoading, router, locale, loadRoutes])

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
          r.region?.toLowerCase().includes(q),
      )
      // Oldest pending first, otherwise most recently updated first
      .sort((a, b) =>
        statusFilter === 'pending'
          ? a.updated_at.localeCompare(b.updated_at)
          : b.updated_at.localeCompare(a.updated_at),
      )
  }, [routes, searchTerm, statusFilter, curatorFilter])

  const curatorCounts = useMemo(() => {
    const inStatus = routes.filter((r) => statusFilter === 'all' || r.status === statusFilter)
    return Object.fromEntries(
      CURATOR_FILTERS.map((f) => [f, inStatus.filter((r) => matchesCurator(r, f)).length]),
    ) as Record<CuratorFilter, number>
  }, [routes, statusFilter])

  const patch = (id: string, updated: Partial<AdminRouteWithUser>) =>
    setRoutes((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)))

  const handleApprove = async (id: string) => {
    try {
      patch(id, await AdminService.approveRoute(id))
    } catch (error) {
      console.error('Error approving route:', error)
      alert(t('errorUpdate'))
    }
  }

  const handleReject = async (id: string, note: string) => {
    try {
      patch(id, await AdminService.rejectRoute(id, note))
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

  const handleDelete = async (id: string) => {
    try {
      await AdminService.deleteRoute(id)
      setRoutes((prev) => prev.filter((route) => route.id !== id))
    } catch (error) {
      console.error('Error deleting route:', error)
      alert(t('errorDelete'))
    }
  }

  const handleDeleteBulk = async (ids: string[]) => {
    try {
      await AdminService.deleteRoutesBulk(ids)
      setRoutes((prev) => prev.filter((route) => !ids.includes(route.id)))
    } catch (error) {
      console.error('Error deleting routes:', error)
      alert(t('errorDeleteBulk'))
    }
  }

  if (authLoading || (loading && !isStaff)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!isStaff) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('pageTitle')}</h1>
        <p className="text-muted-foreground">{t('pageDescription')}</p>
      </div>

      <AdminNav />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={statusFilter === f ? 'default' : 'outline'}
            onClick={() => setStatusFilter(f)}
            className={cn(f === 'pending' && counts.pending > 0 && statusFilter !== f && 'border-amber-400')}
          >
            {f === 'all' ? t('review.all') : tStatus(f)} ({counts[f]})
          </Button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground mr-1">{t('curatorFilter.label')}:</span>
        {CURATOR_FILTERS.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={curatorFilter === f ? 'secondary' : 'ghost'}
            onClick={() => setCuratorFilter(f)}
          >
            {t(`curatorFilter.${f}`)} ({curatorCounts[f]})
          </Button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => loadRoutes(isAdmin)} variant="outline" disabled={loading}>
          <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
          {t('refresh')}
        </Button>
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        {t('totalRoutes', { count: filteredRoutes.length })}
      </div>

      <AdminRoutesTable
        routes={filteredRoutes}
        canDelete={isAdmin}
        onApprove={handleApprove}
        onReject={handleReject}
        onToggleFeatured={handleToggleFeatured}
        onDelete={handleDelete}
        onDeleteBulk={handleDeleteBulk}
      />
    </div>
  )
}
