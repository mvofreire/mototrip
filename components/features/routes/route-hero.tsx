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
    <div className="relative h-[400px] md:h-[500px] overflow-hidden bg-sand-100 border-b">
      {/* Placeholder hero image */}
      <div className="absolute inset-0 bg-gradient-to-br from-sunshine-yellow-200 via-sunshine-orange-200 to-sunshine-pink-200" />
      
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

      <div className="container relative h-full flex flex-col justify-end pb-8 md:pb-12">
        <div className="space-y-4">
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

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl">
            {route.title}
          </h1>

          <div className="flex items-center gap-4">
            <Button className="bg-gradient-sunshine hover:opacity-90">
              <Bookmark className="h-4 w-4 mr-2" />
              Save Route
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
