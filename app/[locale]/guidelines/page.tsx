import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { Shield, Heart, Users, AlertTriangle } from 'lucide-react'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'guidelines' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function GuidelinesPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'guidelines' })

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-12">
          {/* Header */}
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>

          {/* Introduction */}
          <section className="space-y-4">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('intro')}
            </p>
          </section>

          {/* Core Values */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold">{t('values.title')}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Respect */}
              <div className="space-y-3 p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-lg bg-gradient-sunshine flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{t('values.respect.title')}</h3>
                <p className="text-muted-foreground">
                  {t('values.respect.description')}
                </p>
              </div>

              {/* Safety */}
              <div className="space-y-3 p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-lg bg-gradient-sunshine flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{t('values.safety.title')}</h3>
                <p className="text-muted-foreground">
                  {t('values.safety.description')}
                </p>
              </div>

              {/* Collaboration */}
              <div className="space-y-3 p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-lg bg-gradient-sunshine flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{t('values.collaboration.title')}</h3>
                <p className="text-muted-foreground">
                  {t('values.collaboration.description')}
                </p>
              </div>

              {/* Quality */}
              <div className="space-y-3 p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-lg bg-gradient-sunshine flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{t('values.quality.title')}</h3>
                <p className="text-muted-foreground">
                  {t('values.quality.description')}
                </p>
              </div>
            </div>
          </section>

          {/* Content Guidelines */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">{t('content.title')}</h2>
            <p className="text-muted-foreground">{t('content.description')}</p>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">
                {t('content.do.title')}
              </h3>
              <ul className="space-y-2 text-muted-foreground ml-6">
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>{t('content.do.item1')}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>{t('content.do.item2')}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>{t('content.do.item3')}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>{t('content.do.item4')}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>{t('content.do.item5')}</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">
                {t('content.dont.title')}
              </h3>
              <ul className="space-y-2 text-muted-foreground ml-6">
                <li className="flex gap-2">
                  <span className="text-red-600">✗</span>
                  <span>{t('content.dont.item1')}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600">✗</span>
                  <span>{t('content.dont.item2')}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600">✗</span>
                  <span>{t('content.dont.item3')}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600">✗</span>
                  <span>{t('content.dont.item4')}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600">✗</span>
                  <span>{t('content.dont.item5')}</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Reporting */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">{t('reporting.title')}</h2>
            <p className="text-muted-foreground">{t('reporting.description')}</p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-mono text-sm">support@mototrip.com</p>
            </div>
          </section>

          {/* Consequences */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">{t('consequences.title')}</h2>
            <p className="text-muted-foreground">{t('consequences.description')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('consequences.item1')}</li>
              <li>{t('consequences.item2')}</li>
              <li>{t('consequences.item3')}</li>
            </ul>
          </section>

          {/* Thank You */}
          <section className="rounded-lg bg-gradient-sunshine p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">{t('thankYou.title')}</h2>
            <p className="text-lg opacity-90">
              {t('thankYou.message')}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
