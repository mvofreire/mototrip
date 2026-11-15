'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { KEYWORDS, META_DESCRIPTION, META_TITLE, effectiveDescription, effectiveTitle, seoChecks } from '@/lib/blog/seo'
import { SeoScore } from '@/components/admin/seo-score'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getSiteUrl } from '@/lib/site-url'
import { cn } from '@/lib/utils'

export interface SeoFields {
  title: string
  description: string
  body_md: string
  meta_title: string
  meta_description: string
  keywords: string[]
}

function Counter({ n, min, max }: { n: number; min: number; max: number }) {
  const tone = n === 0 ? 'text-muted-foreground' : n < min || n > max ? 'text-amber-600' : 'text-green-600'
  return <span className={cn('text-xs font-medium tabular-nums', tone)}>{n}/{max}</span>
}

function Meter({ n, min, max }: { n: number; min: number; max: number }) {
  const color = n > max ? 'bg-red-500' : n >= min ? 'bg-green-500' : 'bg-amber-500'
  return (
    <div className="h-1 overflow-hidden rounded-full bg-muted">
      <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${Math.min(100, (n / max) * 100)}%` }} />
    </div>
  )
}

/** Meta tags, keywords, search and share previews, and the checklist for one language */
export function SeoPanel({
  value,
  slug,
  locale,
  cover,
  onChange,
}: {
  value: SeoFields
  slug: string
  locale: string
  cover: string | null
  onChange: (patch: Partial<SeoFields>) => void
}) {
  const t = useTranslations('admin.blog.seo')
  const [draft, setDraft] = useState('')
  const { checks, score } = seoChecks(value, slug)
  const title = effectiveTitle(value)
  const description = effectiveDescription(value)
  const host = getSiteUrl().replace(/^https?:\/\//, '')

  const addKeyword = (raw: string) => {
    const k = raw.trim().replace(/,+$/, '')
    if (!k || value.keywords.some((x) => x.toLowerCase() === k.toLowerCase()) || value.keywords.length >= 20) return
    onChange({ keywords: [...value.keywords, k] })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <SeoScore score={score} />
        <div>
          <p className="text-sm font-semibold">{t('score', { language: locale.toUpperCase() })}</p>
          <p className="text-xs text-muted-foreground">{t('perLanguage')}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="meta-title">{t('metaTitle')}</Label>
          <Counter n={title.length} {...META_TITLE} />
        </div>
        <Input id="meta-title" maxLength={120} value={value.meta_title} placeholder={value.title || t('metaTitlePlaceholder')} onChange={(e) => onChange({ meta_title: e.target.value })} />
        <Meter n={title.length} {...META_TITLE} />
        <p className="text-xs text-muted-foreground">{t('metaTitleHelp')}</p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="meta-description">{t('metaDescription')}</Label>
          <Counter n={description.length} {...META_DESCRIPTION} />
        </div>
        <Textarea
          id="meta-description"
          rows={3}
          maxLength={320}
          value={value.meta_description}
          placeholder={value.description || t('metaDescriptionPlaceholder')}
          onChange={(e) => onChange({ meta_description: e.target.value })}
        />
        <Meter n={description.length} {...META_DESCRIPTION} />
        <p className="text-xs text-muted-foreground">{t('metaDescriptionHelp')}</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="keywords">{t('keywords')}</Label>
        <div className="flex flex-wrap items-center gap-1.5 rounded-md border bg-background p-1.5 focus-within:ring-2 focus-within:ring-ring">
          {value.keywords.map((k, i) => (
            <span key={k} className={cn('inline-flex items-center gap-1 rounded border bg-muted px-2 py-0.5 text-xs', i === 0 && 'border-primary/50 bg-primary/10')}>
              {i === 0 && <span className="sr-only">{t('mainKeyword')}: </span>}
              {k}
              <button type="button" aria-label={t('removeKeyword', { keyword: k })} className="text-muted-foreground hover:text-foreground" onClick={() => onChange({ keywords: value.keywords.filter((_, j) => j !== i) })}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            id="keywords"
            value={draft}
            placeholder={value.keywords.length ? '' : t('keywordsPlaceholder')}
            onChange={(e) => {
              const v = e.target.value
              if (v.endsWith(',')) {
                addKeyword(v)
                setDraft('')
              } else setDraft(v)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addKeyword(draft)
                setDraft('')
              } else if (e.key === 'Backspace' && !draft && value.keywords.length) {
                onChange({ keywords: value.keywords.slice(0, -1) })
              }
            }}
            onBlur={() => {
              if (draft.trim()) {
                addKeyword(draft)
                setDraft('')
              }
            }}
            className="min-w-[8rem] flex-1 bg-transparent px-1 py-0.5 text-sm outline-none"
          />
        </div>
        <p className="text-xs text-muted-foreground">{t('keywordsHelp', { min: KEYWORDS.min, max: KEYWORDS.max })}</p>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('googlePreview')}</p>
        <div className="rounded-lg border bg-background p-3 font-[arial,sans-serif]">
          <p className="truncate text-xs text-muted-foreground">
            {host} › {locale} › blog › {slug || '…'}
          </p>
          <p className="mt-0.5 truncate text-lg leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">{title || t('untitled')}</p>
          <p className="line-clamp-2 text-sm text-muted-foreground">{description || t('noDescription')}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('sharePreview')}</p>
        <div className="overflow-hidden rounded-lg border bg-muted/40">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="aspect-[1.91/1] w-full object-cover" />
          ) : (
            <div className="grid aspect-[1.91/1] place-items-center text-xs text-muted-foreground">{t('noCover')}</div>
          )}
          <div className="space-y-0.5 p-2.5">
            <p className="text-[10px] uppercase text-muted-foreground">{host}</p>
            <p className="truncate text-sm font-semibold">{title || t('untitled')}</p>
            <p className="line-clamp-2 text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>

      <ul className="space-y-1.5 text-sm">
        {checks.map((c) => (
          <li key={c.id} className="flex items-start gap-2">
            {c.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />}
            <span className={c.ok ? 'text-muted-foreground' : ''}>{t(`checks.${c.id}`, { ...META_TITLE, dmin: META_DESCRIPTION.min, dmax: META_DESCRIPTION.max, kmin: KEYWORDS.min, kmax: KEYWORDS.max, n: 0, total: 0, ...c.values })}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
