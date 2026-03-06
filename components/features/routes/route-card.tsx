'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { RouteWithDetails } from '@/types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Mountain, Star, Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  formatDistance,
  formatDuration,
  getDifficultyColor,
  getCategoryColor,
  formatRating,
} from '@/lib/utils'

interface RouteCardProps {
  route: RouteWithDetails
  locale: string
  variant?: 'grid' | 'list'
}

export function RouteCard({ route, locale, variant = 'grid' }: RouteCardProps) {
  const t = useTranslations()
  
  const categoryLabels = {
    scenic: t('categories.scenic'),
    mountain: t('categories.mountain'),
    coastal: t('categories.coastal'),
    weekend: t('categories.weekend'),
    adventure: t('categories.adventure'),
  }

  const difficultyLabels = {
    easy: t('difficulty.easy'),
    moderate: t('difficulty.moderate'),
    challenging: t('difficulty.challenging'),
    expert: t('difficulty.expert'),
  }

  if (variant === 'list') {
    return (
      <Link href={`/${locale}/routes/${route.id}`}>
        <Card className="group overflow-hidden transition-all hover:shadow-lg">
          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden bg-sand-100 shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-sunshine-yellow-100 to-sunshine-orange-100" />
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="h-12 w-12 text-sunshine-orange-300" />
              </div>

              {route.featured && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-sunshine-yellow-400 text-sunshine-yellow-900 border-0">
                    {t('route.featured')}
                  </Badge>
                </div>
              )}

              <Button
                size="icon"
                variant="secondary"
                className="absolute top-3 right-3 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault()
                }}
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              <div className="flex flex-col h-full">
                <div className="flex-1 space-y-3">
                  {/* Category & Difficulty */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getCategoryColor(route.category)}>
                      {categoryLabels[route.category]}
                    </Badge>
                    <Badge variant="outline" className={getDifficultyColor(route.difficulty)}>
                      {difficultyLabels[route.difficulty]}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-xl leading-tight group-hover:text-primary transition-colors">
                    {route.title}
                  </h3>

                  {/* Region */}
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{route.region}</span>
                  </div>

                  {/* Description (opcional) */}
                  {route.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {route.description}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Distance</span>
                      <span className="text-sm font-medium">{formatDistance(route.distance_km)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Duration</span>
                      <span className="text-sm font-medium">{formatDuration(route.duration_minutes)}</span>
                    </div>
                  </div>
                  {route.elevation_gain_m && (
                    <div className="flex items-center gap-2">
                      <Mountain className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Elevation</span>
                        <span className="text-sm font-medium">{route.elevation_gain_m}m</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <Star className="h-4 w-4 fill-sunshine-yellow-400 text-sunshine-yellow-400" />
                    <span className="text-sm font-medium">
                      {route.average_rating ? formatRating(route.average_rating) : 'N/A'}
                    </span>
                    {route.rating_count && (
                      <span className="text-xs text-muted-foreground">
                        ({route.rating_count})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/${locale}/routes/${route.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <CardHeader className="p-0">
          <div className="relative aspect-[16/9] overflow-hidden bg-sand-100">
            {/* Placeholder for route image */}
            <div className="absolute inset-0 bg-gradient-to-br from-sunshine-yellow-100 to-sunshine-orange-100" />
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin className="h-16 w-16 text-sunshine-orange-300" />
            </div>

            {/* Featured badge */}
            {route.featured && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-sunshine-yellow-400 text-sunshine-yellow-900 border-0">
                  {t('route.featured')}
                </Badge>
              </div>
            )}

            {/* Save button */}
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-3 right-3 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.preventDefault()
                // Handle save
              }}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Category & Difficulty */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getCategoryColor(route.category)}>
                {categoryLabels[route.category]}
              </Badge>
              <Badge variant="outline" className={getDifficultyColor(route.difficulty)}>
                {difficultyLabels[route.difficulty]}
              </Badge>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {route.title}
            </h3>

            {/* Region */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{route.region}</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Distance</span>
                <span className="text-sm font-medium">{formatDistance(route.distance_km)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Duration</span>
                <span className="text-sm font-medium">{formatDuration(route.duration_minutes)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-sunshine-yellow-400 text-sunshine-yellow-400" />
                  <span className="text-sm font-medium">
                    {route.average_rating ? formatRating(route.average_rating) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              {route.rating_count && (
                <span>{route.rating_count} reviews</span>
              )}
            </div>
            {route.elevation_gain_m && (
              <div className="flex items-center gap-1">
                <Mountain className="h-3.5 w-3.5" />
                <span>{route.elevation_gain_m}m elevation</span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
