'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RouteCard } from '@/components/features/routes/route-card'
import { RouteFilters } from '@/components/features/routes/route-filters'
import { mockRoutes } from '@/lib/mock-data'
import { RouteFilters as RouteFiltersType } from '@/types'
import { Search, SlidersHorizontal } from 'lucide-react'

export default function ExplorePage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = useTranslations('explore')
  const [filters, setFilters] = useState<RouteFiltersType>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Filter logic (simplified for MVP)
  const filteredRoutes = mockRoutes.filter(route => {
    if (searchQuery && !route.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (filters.category?.length && !filters.category.includes(route.category)) {
      return false
    }
    if (filters.difficulty?.length && !filters.difficulty.includes(route.difficulty)) {
      return false
    }
    if (filters.min_distance && route.distance_km < filters.min_distance) {
      return false
    }
    if (filters.max_distance && route.distance_km > filters.max_distance) {
      return false
    }
    if (filters.min_duration && route.duration_minutes < filters.min_duration) {
      return false
    }
    if (filters.max_duration && route.duration_minutes > filters.max_duration) {
      return false
    }
    if (filters.min_scenic_score && route.scenic_score < filters.min_scenic_score) {
      return false
    }
    return true
  })

  return (
    <div className="container py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-lg">
            {t('subtitle', { count: mockRoutes.length })}
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
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block`}>
            <RouteFilters filters={filters} onFiltersChange={setFilters} />
          </aside>

          {/* Routes Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t('results', { count: filteredRoutes.length })}
              </p>
            </div>

            {filteredRoutes.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {filteredRoutes.map((route) => (
                  <RouteCard key={route.id} route={route} locale={locale} />
                ))}
              </div>
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
