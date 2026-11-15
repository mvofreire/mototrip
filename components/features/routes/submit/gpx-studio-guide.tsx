'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { BookOpen, ExternalLink } from 'lucide-react'

export const GPX_STUDIO_POST_SLUG = 'como-criar-gpx-de-rota-de-moto-no-gpx-studio'
const GPX_STUDIO_URL = 'https://gpx.studio/app'

/** How to create the GPX in gpx.studio, from the blog post of the same name */
export function GpxStudioGuide({ locale }: { locale: string }) {
  const t = useTranslations('submitWizard.guide')
  const steps = ['step1', 'step2', 'step3', 'step4', 'step5'] as const
  const icons = ['iconFuel', 'iconRestaurant', 'iconHotel', 'iconScenic', 'iconCafe'] as const

  return (
    <aside className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-brand-600 bg-[linear-gradient(160deg,rgba(245,41,61,.12),transparent_60%)] bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/15 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300">
          <BookOpen className="h-3.5 w-3.5" aria-hidden />
          {t('badge')}
        </span>
        <span className="text-xs text-muted-foreground">{t('meta')}</span>
      </div>
      <h3 className="font-display text-[26px] font-extrabold uppercase leading-[0.95]">{t('title')}</h3>
      <ol className="flex flex-col gap-2.5">
        {steps.map((key, i) => (
          <li key={key} className="grid grid-cols-[26px_minmax(0,1fr)] items-start gap-2.5 text-[13.5px] text-foreground/85">
            <span className="grid h-[26px] w-[26px] place-items-center rounded-lg bg-brand-600 text-xs font-bold text-white">
              {i + 1}
            </span>
            <span>{t.rich(key, { b: (chunks) => <b className="text-foreground">{chunks}</b> })}</span>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-1.5">
        {icons.map((key) => (
          <span key={key} className="rounded-md border bg-muted/60 px-2 py-0.5 text-[11.5px] text-foreground/80">
            {t(key)}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/${locale}/blog/${GPX_STUDIO_POST_SLUG}`}
          target="_blank"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <BookOpen className="h-4 w-4" aria-hidden />
          {t('readPost')}
        </Link>
        <a
          href={GPX_STUDIO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors hover:bg-muted"
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          {t('openStudio')}
        </a>
      </div>
    </aside>
  )
}
