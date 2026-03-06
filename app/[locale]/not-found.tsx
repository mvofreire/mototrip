import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'

export default function NotFound() {
  const t = useTranslations('notFound')
  
  return (
    <div className="container flex items-center justify-center min-h-[600px]">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-gradient-sunshine flex items-center justify-center">
            <MapPin className="h-12 w-12 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold">{t('title')}</h1>
          <h2 className="text-2xl font-semibold">{t('subtitle')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-gradient-sunshine hover:opacity-90">
            <Link href="/">
              {t('backToHome')}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/explore">
              {t('exploreRoutes')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
