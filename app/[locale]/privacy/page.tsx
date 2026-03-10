import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'privacy' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function PrivacyPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'privacy' })

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('lastUpdated')}: {t('date')}
            </p>
          </div>

          {/* Introduction */}
          <section className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t('intro')}
            </p>
          </section>

          {/* Information We Collect */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{t('collection.title')}</h2>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">{t('collection.personal.title')}</h3>
              <p className="text-muted-foreground">{t('collection.personal.description')}</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>{t('collection.personal.item1')}</li>
                <li>{t('collection.personal.item2')}</li>
                <li>{t('collection.personal.item3')}</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">{t('collection.route.title')}</h3>
              <p className="text-muted-foreground">{t('collection.route.description')}</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>{t('collection.route.item1')}</li>
                <li>{t('collection.route.item2')}</li>
                <li>{t('collection.route.item3')}</li>
              </ul>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{t('usage.title')}</h2>
            <p className="text-muted-foreground">{t('usage.description')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('usage.item1')}</li>
              <li>{t('usage.item2')}</li>
              <li>{t('usage.item3')}</li>
              <li>{t('usage.item4')}</li>
              <li>{t('usage.item5')}</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{t('sharing.title')}</h2>
            <p className="text-muted-foreground">{t('sharing.description')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('sharing.item1')}</li>
              <li>{t('sharing.item2')}</li>
              <li>{t('sharing.item3')}</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{t('security.title')}</h2>
            <p className="text-muted-foreground">{t('security.description')}</p>
          </section>

          {/* Your Rights */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{t('rights.title')}</h2>
            <p className="text-muted-foreground">{t('rights.description')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('rights.item1')}</li>
              <li>{t('rights.item2')}</li>
              <li>{t('rights.item3')}</li>
              <li>{t('rights.item4')}</li>
            </ul>
          </section>

          {/* Cookies */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{t('cookies.title')}</h2>
            <p className="text-muted-foreground">{t('cookies.description')}</p>
          </section>

          {/* Children's Privacy */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{t('children.title')}</h2>
            <p className="text-muted-foreground">{t('children.description')}</p>
          </section>

          {/* Changes to Policy */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{t('changes.title')}</h2>
            <p className="text-muted-foreground">{t('changes.description')}</p>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{t('contact.title')}</h2>
            <p className="text-muted-foreground">{t('contact.description')}</p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-mono text-sm">privacy@mototrip.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
