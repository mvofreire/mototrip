'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { AdminService, AdminRouteWithUser } from '@/lib/services/admin.service'
import { AdminRoutesTable } from '@/components/admin/admin-routes-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RefreshCw, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const t = useTranslations('admin')
  const [routes, setRoutes] = useState<AdminRouteWithUser[]>([])
  const [filteredRoutes, setFilteredRoutes] = useState<AdminRouteWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdminAndLoadRoutes = async () => {
      if (authLoading) return

      if (!user) {
        router.push('/login')
        return
      }

      // Check if user is admin
      const adminStatus = await AdminService.isAdmin()
      setIsAdmin(adminStatus)

      if (!adminStatus) {
        router.push('/profile')
        return
      }

      // Load routes
      await loadRoutes()
    }

    checkAdminAndLoadRoutes()
  }, [user, authLoading, router])

  const loadRoutes = async () => {
    setLoading(true)
    try {
      const data = await AdminService.getAllRoutes()
      setRoutes(data)
      setFilteredRoutes(data)
    } catch (error) {
      console.error('Error loading routes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchTerm) {
      const filtered = routes.filter(
        (route) =>
          route.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          route.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          route.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          route.region?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredRoutes(filtered)
    } else {
      setFilteredRoutes(routes)
    }
  }, [searchTerm, routes])

  const handleTogglePublished = async (id: string, published: boolean) => {
    try {
      await AdminService.togglePublished(id, published)
      setRoutes((prev) =>
        prev.map((route) => (route.id === id ? { ...route, published } : route))
      )
    } catch (error) {
      console.error('Error toggling published status:', error)
      alert(t('errorTogglePublished'))
    }
  }

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      await AdminService.toggleFeatured(id, featured)
      setRoutes((prev) =>
        prev.map((route) => (route.id === id ? { ...route, featured } : route))
      )
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

  const handleUpdate = async (id: string, updates: any) => {
    try {
      await AdminService.updateRoute(id, updates)
      setRoutes((prev) =>
        prev.map((route) => (route.id === id ? { ...route, ...updates } : route))
      )
    } catch (error) {
      console.error('Error updating route:', error)
      alert(t('errorUpdate'))
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const translations = {
    title: t('table.title'),
    user: t('table.user'),
    category: t('table.category'),
    difficulty: t('table.difficulty'),
    distance: t('table.distance'),
    status: t('table.status'),
    featured: t('table.featured'),
    created: t('table.created'),
    actions: t('table.actions'),
    noRoutes: t('table.noRoutes'),
    categories: {
      scenic: t('categories.scenic'),
      mountain: t('categories.mountain'),
      coastal: t('categories.coastal'),
      weekend: t('categories.weekend'),
      adventure: t('categories.adventure'),
    },
    difficulties: {
      easy: t('difficulties.easy'),
      moderate: t('difficulties.moderate'),
      challenging: t('difficulties.challenging'),
      expert: t('difficulties.expert'),
    },
    deleteTitle: t('deleteDialog.title'),
    deleteDescription: t('deleteDialog.description'),
    cancel: t('deleteDialog.cancel'),
    delete: t('deleteDialog.delete'),
    editTitle: t('editDialog.title'),
    editDescription: t('editDialog.description'),
    titleLabel: t('editDialog.titleLabel'),
    descriptionLabel: t('editDialog.descriptionLabel'),
    difficultyLabel: t('editDialog.difficultyLabel'),
    categoryLabel: t('editDialog.categoryLabel'),
    distanceLabel: t('editDialog.distanceLabel'),
    durationLabel: t('editDialog.durationLabel'),
    elevationLabel: t('editDialog.elevationLabel'),
    regionLabel: t('editDialog.regionLabel'),
    save: t('editDialog.save'),
    saving: t('editDialog.saving'),
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('pageTitle')}</h1>
        <p className="text-muted-foreground">{t('pageDescription')}</p>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={loadRoutes} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('refresh')}
        </Button>
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        {t('totalRoutes', { count: filteredRoutes.length })}
      </div>

      <AdminRoutesTable
        routes={filteredRoutes}
        onTogglePublished={handleTogglePublished}
        onToggleFeatured={handleToggleFeatured}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        translations={translations}
      />
    </div>
  )
}
