import { RouteStop } from '@/types'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { getStopIcon } from '@/lib/utils'

interface StopsTimelineProps {
  stops: RouteStop[]
}

export function StopsTimeline({ stops }: StopsTimelineProps) {
  const t = useTranslations()

  return (
    <div className="space-y-3">
      {stops.map((stop, index) => (
        <Card key={stop.id}>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-brand-500/15 flex items-center justify-center text-lg">
                  {getStopIcon(stop.type)}
                </div>
                {index < stops.length - 1 && (
                  <div className="flex-1 w-0.5 bg-border mt-2" />
                )}
              </div>

              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{stop.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t(`stopTypes.${stop.type}`)}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {t('route.stop', { number: stop.order_index + 1 })}
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
