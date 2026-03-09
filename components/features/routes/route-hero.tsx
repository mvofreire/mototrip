import { RouteWithDetails } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bookmark, Share2 } from 'lucide-react'
import { getDifficultyColor, getCategoryColor } from '@/lib/utils'

interface RouteHeroProps {
  route: RouteWithDetails
}

export function RouteHero({ route }: RouteHeroProps) {
  const categoryLabels = {
    scenic: 'Scenic',
    mountain: 'Mountain',
    coastal: 'Coastal',
    weekend: 'Weekend',
    adventure: 'Adventure',
  }

  const difficultyLabels = {
    easy: 'Easy',
    moderate: 'Moderate',
    challenging: 'Challenging',
    expert: 'Expert',
  }

  return (
    <div className="relative h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden bg-sand-100 border-b">
      {/* Placeholder hero image */}
      <div className="absolute inset-0 bg-gradient-to-br from-sunshine-yellow-200 via-sunshine-orange-200 to-sunshine-pink-200" />
      
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

      <div className="container mx-auto max-w-7xl relative h-full flex flex-col justify-end pb-6 md:pb-8 lg:pb-12 px-4">
        <div className="space-y-3 md:space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={getCategoryColor(route.category)}>
              {categoryLabels[route.category]}
            </Badge>
            <Badge variant="outline" className={getDifficultyColor(route.difficulty)}>
              {difficultyLabels[route.difficulty]}
            </Badge>
            {route.featured && (
              <Badge className="bg-sunshine-yellow-400 text-sunshine-yellow-900 border-0">
                Featured
              </Badge>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight max-w-3xl break-words">
            {route.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <Button className="bg-gradient-sunshine hover:opacity-90 text-sm md:text-base">
              <Bookmark className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              Save Route
            </Button>
            <Button variant="outline" className="text-sm md:text-base">
              <Share2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
