import { RouteWithDetails } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { formatRating } from '@/lib/utils'

interface RouteRatingsProps {
  route: RouteWithDetails
}

export function RouteRatings({ route }: RouteRatingsProps) {
  // Mock reviews for demonstration
  const mockReviews = [
    {
      id: '1',
      user: 'Alex Johnson',
      rating: 9.5,
      date: '2024-02-15',
      comment: 'Absolutely stunning route! The coastal views are breathtaking. Perfect road conditions and plenty of great stops along the way.',
    },
    {
      id: '2',
      user: 'Maria Garcia',
      rating: 9.0,
      date: '2024-02-10',
      comment: 'One of the best rides of my life. The twisties are challenging but so much fun. Highly recommend for experienced riders.',
    },
    {
      id: '3',
      user: 'John Smith',
      rating: 8.5,
      date: '2024-02-05',
      comment: 'Great route with amazing scenery. Some sections could use better maintenance, but overall a fantastic experience.',
    },
  ]

  return (
    <div className="space-y-4">
      {mockReviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{review.user}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-sunshine-yellow-400 text-sunshine-yellow-400" />
                  <span className="font-semibold">{formatRating(review.rating)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {review.comment}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
