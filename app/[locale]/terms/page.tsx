import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'terms' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function TermsPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'terms' })

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

          {/* Acceptance of Terms */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{t('acceptance.title')}</h2>
            <p className="text-muted-foreground">{t('acceptance.description')}</p>
          </section>

          {/* User Accounts */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{t('accounts.title')}</h2>
            <p className="text-muted-foreground">{t('accounts.description')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('accounts.item1')}</li>
              <li>{t('accounts.item2')}</li>
              <li>{t('accounts.item3')}</li>
              <li>{t('accounts.item4')}</li>
            </ul>
          </section>

          {/* User Content */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{t('content.title')}</h2>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">{t('content.ownership.title')}</h3>
              <p className="text-muted-foreground">{t('content.ownership.description')}</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">{t('content.license.title')}</h3>
              <p className="text-muted-foreground">{t('content.license.description')}</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">{t('content.prohibited.title')}</h3>
              <p className="text-muted-foreground">{t('content.prohibited.description')}</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>{t('content.prohibited.item1')}</li>
                <li>{t('content.prohibited.item2')}</li>
                <li>{t('content.prohibited.item3')}</li>
                <li>{t('content.prohibited.item4')}</li>
                <li>{t('content.prohibited.item5')}</li>
              </ul>
            </div>
          </section>

          {/* Route Information */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{t('routes.title')}</h2>
            <p className="text-muted-foreground">{t('routes.description')}</p>
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
              <p className="text-amber-900 dark:text-amber-200 font-semibold">
                {t('routes.disclaimer')}
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{t('intellectual.title')}</h2>
            <p className="text-muted-foreground">{t('intellectual.description')}</p>
          </section>

          {/* Disclaimer of Warranties */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{t('disclaimer.title')}</h2>
            <p className="text-muted-foreground">{t('disclaimer.description')}</p>
          </section>

          {/* Limitation of Liability */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{t('liability.title')}</h2>
            <p className="text-muted-foreground">{t('liability.description')}</p>
          </section>

          {/* Termination */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{t('termination.title')}</h2>
            <p className="text-muted-foreground">{t('termination.description')}</p>
          </section>

          {/* Governing Law */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{t('law.title')}</h2>
            <p className="text-muted-foreground">{t('law.description')}</p>
          </section>

          {/* Changes to Terms */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{t('changes.title')}</h2>
            <p className="text-muted-foreground">{t('changes.description')}</p>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{t('contact.title')}</h2>
            <p className="text-muted-foreground">{t('contact.description')}</p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-mono text-sm">legal@mototrip.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
