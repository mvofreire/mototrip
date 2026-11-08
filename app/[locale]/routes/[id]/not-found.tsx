import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'

export default function NotFound() {
  const t = useTranslations()
  const locale = useLocale()
  return (
    <div className="container flex items-center justify-center min-h-[600px]">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-gradient-brand flex items-center justify-center">
            <MapPin className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold">{t('route.notFoundTitle')}</h2>
          <p className="text-muted-foreground">
            {t('route.notFoundDescription')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-gradient-brand hover:opacity-90">
            <Link href={`/${locale}`}>
              {t('notFound.backToHome')}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/${locale}/explore`}>
              {t('notFound.exploreRoutes')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
