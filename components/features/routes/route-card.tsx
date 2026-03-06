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
}

export function RouteCard({ route, locale }: RouteCardProps) {
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
