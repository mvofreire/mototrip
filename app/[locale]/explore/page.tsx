'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RouteCard } from '@/components/features/routes/route-card'
import { RouteFilters } from '@/components/features/routes/route-filters'
import { RoutesOverviewMap } from '@/components/features/routes/routes-overview-map'
import { RoutesService } from '@/lib/services/routes.service'
import { RouteFilters as RouteFiltersType } from '@/types'
import { Search, SlidersHorizontal, LayoutGrid, List, Map as MapIcon, Loader2 } from 'lucide-react'

type ViewMode = 'grid' | 'list' | 'map'

export default function ExplorePage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = useTranslations('explore')
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize filters from URL params
  const getFiltersFromURL = (): RouteFiltersType => {
    const urlFilters: RouteFiltersType = {}
    
    const categories = searchParams.getAll('category')
    if (categories.length > 0) urlFilters.category = categories as any
    
    const difficulties = searchParams.getAll('difficulty')
    if (difficulties.length > 0) urlFilters.difficulty = difficulties as any
    
    const minDistance = searchParams.get('min_distance')
    if (minDistance) urlFilters.min_distance = parseInt(minDistance)
    
    const maxDistance = searchParams.get('max_distance')
    if (maxDistance) urlFilters.max_distance = parseInt(maxDistance)
    
    const minDuration = searchParams.get('min_duration')
    if (minDuration) urlFilters.min_duration = parseInt(minDuration)
    
    const maxDuration = searchParams.get('max_duration')
    if (maxDuration) urlFilters.max_duration = parseInt(maxDuration)
    
    const minScore = searchParams.get('min_scenic_score')
    if (minScore) urlFilters.min_scenic_score = parseFloat(minScore)
    
    return urlFilters
  }
  
  const [filters, setFilters] = useState<RouteFiltersType>(getFiltersFromURL())
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [routes, setRoutes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (filters.category && filters.category.length > 0) {
      filters.category.forEach(cat => params.append('category', cat))
    }
    
    if (filters.difficulty && filters.difficulty.length > 0) {
      filters.difficulty.forEach(diff => params.append('difficulty', diff))
    }
    
    if (filters.min_distance !== undefined && filters.min_distance > 0) {
      params.set('min_distance', filters.min_distance.toString())
    }
    
    if (filters.max_distance !== undefined && filters.max_distance < 500) {
      params.set('max_distance', filters.max_distance.toString())
    }
    
    if (filters.min_duration !== undefined && filters.min_duration > 0) {
      params.set('min_duration', filters.min_duration.toString())
    }
    
    if (filters.max_duration !== undefined && filters.max_duration < 720) {
      params.set('max_duration', filters.max_duration.toString())
    }
    
    if (filters.min_scenic_score !== undefined && filters.min_scenic_score > 0) {
      params.set('min_scenic_score', filters.min_scenic_score.toString())
    }
    
    if (searchQuery) {
      params.set('search', searchQuery)
    }
    
    const newURL = `/${locale}/explore${params.toString() ? '?' + params.toString() : ''}`
    router.replace(newURL, { scroll: false })
  }, [filters, searchQuery, locale, router])

  // Fetch routes from Supabase
  useEffect(() => {
    async function fetchRoutes() {
      setLoading(true)
      setError(null)
      try {
        const data = await RoutesService.getRoutes({
          ...filters,
          search: searchQuery || undefined,
        })
        setRoutes(data)
      } catch (err) {
        console.error('Error fetching routes:', err)
        setError('Erro ao carregar rotas')
      } finally {
        setLoading(false)
      }
    }

    fetchRoutes()
  }, [filters, searchQuery])

  // Filter logic is now handled by the service
  const filteredRoutes = routes

  return (
    <div className="container py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-lg">
            {t('subtitle', { count: routes.length })}
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('searchPlaceholder')}
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="md:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {t('filters')}
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 md:grid-cols-[280px_1fr]">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block md:sticky md:top-20 md:self-start`}>
            <RouteFilters filters={filters} onFiltersChange={setFilters} />
          </aside>

          {/* Routes Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t('results', { count: filteredRoutes.length })}
              </p>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                  title="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="h-8 w-8 p-0"
                  title="Map view"
                >
                  <MapIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive">{error}</p>
              </div>
            ) : filteredRoutes.length > 0 ? (
              <>
                {viewMode === 'map' ? (
                  <div className="space-y-6">
                    <RoutesOverviewMap routes={filteredRoutes} locale={locale} />
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                      {filteredRoutes.map((route) => (
                        <RouteCard key={route.id} route={route} locale={locale} />
                      ))}
                    </div>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {filteredRoutes.map((route) => (
                      <RouteCard key={route.id} route={route} locale={locale} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {filteredRoutes.map((route) => (
                      <RouteCard key={route.id} route={route} locale={locale} variant="list" />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('noResults')}</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setFilters({})
                    setSearchQuery('')
                  }}
                >
                  {t('clearFilters')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
