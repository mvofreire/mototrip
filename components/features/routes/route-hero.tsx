import { RouteWithDetails } from '@/types'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import { ShareRouteButton } from '@/components/features/routes/share-route-button'
import { SaveRouteButton } from '@/components/features/routes/save-route-button'
import { RouteCover } from '@/components/features/routes/route-cover'
import { getDifficultyColor, getCategoryColor } from '@/lib/utils'

interface RouteHeroProps {
  route: RouteWithDetails
}

export function RouteHero({ route }: RouteHeroProps) {
  const t = useTranslations()

  return (
    <div className="relative h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden bg-sand-100 border-b">
      {/* Placeholder hero image */}
      <div className="absolute inset-0 bg-gradient-to-br from-steel-300 via-steel-200 to-brand-100 dark:from-steel-900 dark:via-steel-800 dark:to-brand-950" />
      <RouteCover route={route} />

      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-background via-background/30 to-transparent" />

      <div className="container mx-auto max-w-7xl relative z-[2] h-full pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto flex flex-col justify-end pb-6 md:pb-8 lg:pb-12 px-4">
        <div className="space-y-3 md:space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={getCategoryColor(route.category)}>
              {t(`categories.${route.category}`)}
            </Badge>
            <Badge variant="outline" className={getDifficultyColor(route.difficulty)}>
              {t(`difficulty.${route.difficulty}`)}
            </Badge>
            {route.featured && (
              <Badge className="bg-brand-600 text-white border-0 uppercase tracking-wide">
                {t('route.featured')}
              </Badge>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight max-w-3xl break-words">
            {route.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <SaveRouteButton routeId={route.id} />
            <ShareRouteButton route={route} />
          </div>
        </div>
      </div>
    </div>
  )
}
