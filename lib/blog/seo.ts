/**
 * SEO checklist for one language of a blog post, shown in the admin editor
 * (with the score) and as a score badge in the post list.
 */

import type { BlogTranslation } from '@/lib/blog/posts'

export const META_TITLE = { min: 30, max: 60 }
export const META_DESCRIPTION = { min: 120, max: 160 }
export const KEYWORDS = { min: 3, max: 8 }

export type SeoCheckId =
  | 'titleLength'
  | 'descriptionLength'
  | 'keywordCount'
  | 'keywordInTitle'
  | 'keywordInDescription'
  | 'hasHeadings'
  | 'imagesAlt'
  | 'slug'

export interface SeoCheck {
  id: SeoCheckId
  ok: boolean
  /** Values for the check's message (counts, lengths) */
  values?: Record<string, number>
}

type SeoInput = Pick<BlogTranslation, 'title' | 'description' | 'meta_title' | 'meta_description' | 'keywords'> & {
  /** Body Markdown; leave undefined when it was not loaded (list view) */
  body_md?: string
}

/** What search engines see: the override, else the post's own title / description */
export const effectiveTitle = (t: Pick<BlogTranslation, 'title' | 'meta_title'>) => t.meta_title?.trim() || t.title
export const effectiveDescription = (t: Pick<BlogTranslation, 'description' | 'meta_description'>) =>
  t.meta_description?.trim() || t.description

const IMAGE = /!\[([^\]]*)\]\([^)]*\)/g
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function seoChecks(t: SeoInput, slug: string): { checks: SeoCheck[]; score: number } {
  const title = effectiveTitle(t)
  const description = effectiveDescription(t)
  const keywords = t.keywords ?? []
  const main = keywords[0] ? norm(keywords[0]) : ''
  const checks: SeoCheck[] = [
    { id: 'titleLength', ok: title.length >= META_TITLE.min && title.length <= META_TITLE.max, values: { n: title.length } },
    {
      id: 'descriptionLength',
      ok: description.length >= META_DESCRIPTION.min && description.length <= META_DESCRIPTION.max,
      values: { n: description.length },
    },
    { id: 'keywordCount', ok: keywords.length >= KEYWORDS.min && keywords.length <= KEYWORDS.max, values: { n: keywords.length } },
    { id: 'keywordInTitle', ok: !!main && norm(title).includes(main) },
    { id: 'keywordInDescription', ok: !!main && norm(description).includes(main) },
    { id: 'slug', ok: !!slug && slug.length <= 60 },
  ]
  if (t.body_md !== undefined) {
    const images = Array.from(t.body_md.matchAll(IMAGE))
    const withAlt = images.filter((m) => m[1].trim()).length
    checks.push({ id: 'hasHeadings', ok: /^##\s+\S/m.test(t.body_md) })
    checks.push({ id: 'imagesAlt', ok: images.length > 0 && withAlt === images.length, values: { n: withAlt, total: images.length } })
  }
  return { checks, score: Math.round((checks.filter((c) => c.ok).length / checks.length) * 100) }
}

export const scoreTone = (score: number) => (score >= 75 ? 'good' : score >= 45 ? 'warn' : 'bad')
