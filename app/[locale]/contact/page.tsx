import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo'
import { Instagram, Mail } from 'lucide-react'
import { INSTAGRAM } from '@/lib/social'
import { ContactForm } from '@/components/contact-form'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'contact' })

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates(locale, '/contact'),
  }
}

export default async function ContactPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'contact' })

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 rounded-lg bg-gradient-brand flex items-center justify-center">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-xl text-muted-foreground">{t('subtitle')}</p>
        </div>

        <section className="rounded-lg border bg-card p-6 sm:p-8">
          <ContactForm />
        </section>

        <p className="flex flex-wrap items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <Instagram className="h-4 w-4" />
          {t('instagram')}
          <a
            href={INSTAGRAM.url}
            target="_blank"
            rel="noopener noreferrer me"
            className="font-medium text-foreground hover:underline"
          >
            @{INSTAGRAM.handle}
          </a>
        </p>
      </div>
    </div>
  )
}
