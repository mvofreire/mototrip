import { RouteStop } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { getStopIcon } from '@/lib/utils'

interface StopsTimelineProps {
  stops: RouteStop[]
}

export function StopsTimeline({ stops }: StopsTimelineProps) {
  const stopTypeLabels = {
    viewpoint: 'Viewpoint',
    cafe: 'Café',
    gas_station: 'Gas Station',
    restaurant: 'Restaurant',
    landmark: 'Landmark',
    accommodation: 'Accommodation',
  }

  return (
    <div className="space-y-3">
      {stops.map((stop, index) => (
        <Card key={stop.id}>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-sunshine-coral-100 flex items-center justify-center text-lg">
                  {getStopIcon(stop.type)}
                </div>
                {index < stops.length - 1 && (
                  <div className="flex-1 w-0.5 bg-sand-200 mt-2" />
                )}
              </div>

              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{stop.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {stopTypeLabels[stop.type]}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Stop {stop.order_index}
                  </span>
                </div>
                {stop.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {stop.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
