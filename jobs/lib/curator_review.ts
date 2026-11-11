/**
 * Shape of the MotoTrip curator reviews in jobs/data/curator_reviews_<cc>.ts
 * (written by the /rate-routes skill, imported by jobs/import_curator_reviews.ts).
 *
 * Scores are 1–5 in half steps. Texts are in European Portuguese; `i18n` holds
 * en/es/fr/de. Every claim in the verdict must be backed by one of `sources`.
 */

export type CuratorLocale = 'en' | 'es' | 'fr' | 'de';
export const CURATOR_LOCALES: CuratorLocale[] = ['en', 'es', 'fr', 'de'];

export interface CuratorReviewText {
  verdict: string;
  highlights: string[];
  warnings: string[];
  best_season?: string;
}

export interface CuratorReviewSource {
  title: string;
  url: string;
  /** Site name, e.g. "MotorcycleRoads.com" */
  site?: string;
  /** Language of the page (pt, es, fr, en, de…) */
  lang?: string;
}

export interface CuratorReviewEntry extends CuratorReviewText {
  /** routes.slug — never changes after a route is created */
  slug: string;
  overall: number;
  scenic: number;
  road: number;
  fun: number;
  /** high: 3+ independent sources agree; medium: 2; low: 1 or thin/conflicting */
  confidence: 'high' | 'medium' | 'low';
  /** ISO date of the research, e.g. "2026-11-11" */
  researched_at: string;
  sources: CuratorReviewSource[];
  i18n: Record<CuratorLocale, CuratorReviewText>;
}

const isHalfStep = (n: number) => Number.isFinite(n) && n >= 1 && n <= 5 && Number.isInteger(n * 2);

/** Returns a list of problems (empty = valid). */
export function validateCuratorReview(e: CuratorReviewEntry): string[] {
  const errors: string[] = [];
  for (const k of ['overall', 'scenic', 'road', 'fun'] as const) {
    if (!isHalfStep(e[k])) errors.push(`${k}=${e[k]} must be 1–5 in half steps`);
  }
  const avg = (e.scenic + e.road + e.fun) / 3;
  if (Math.abs(e.overall - avg) > 1) errors.push(`overall ${e.overall} is far from the average ${avg.toFixed(1)}`);

  const checkText = (t: CuratorReviewText | undefined, label: string) => {
    if (!t) return errors.push(`${label}: missing`);
    if (!t.verdict?.trim()) errors.push(`${label}: empty verdict`);
    if (t.verdict && t.verdict.length > 1500) errors.push(`${label}: verdict longer than 1500 chars`);
    if (t.best_season && t.best_season.length > 200) errors.push(`${label}: best_season longer than 200 chars`);
    if (!Array.isArray(t.highlights) || !Array.isArray(t.warnings)) errors.push(`${label}: highlights/warnings must be arrays`);
  };
  checkText(e, 'pt');
  for (const l of CURATOR_LOCALES) {
    const t = e.i18n?.[l];
    checkText(t, l);
    if (!t) continue;
    if (t.highlights?.length !== e.highlights.length) errors.push(`${l}: ${t.highlights?.length} highlights, pt has ${e.highlights.length}`);
    if (t.warnings?.length !== e.warnings.length) errors.push(`${l}: ${t.warnings?.length} warnings, pt has ${e.warnings.length}`);
    if (!!t.best_season !== !!e.best_season) errors.push(`${l}: best_season present in one language only`);
  }

  if (!e.sources?.length) errors.push('no sources');
  const urls = new Set<string>();
  for (const s of e.sources ?? []) {
    if (!s.title?.trim()) errors.push(`source without title: ${s.url}`);
    try {
      const u = new URL(s.url);
      if (u.protocol !== 'https:' && u.protocol !== 'http:') errors.push(`bad source url: ${s.url}`);
    } catch {
      errors.push(`bad source url: ${s.url}`);
    }
    if (urls.has(s.url)) errors.push(`duplicate source: ${s.url}`);
    urls.add(s.url);
  }
  const hosts = new Set((e.sources ?? []).map((s) => { try { return new URL(s.url).hostname.replace(/^www\./, ''); } catch { return s.url; } }));
  if (e.confidence === 'high' && hosts.size < 3) errors.push(`confidence high needs 3+ sites (has ${hosts.size})`);
  if (e.confidence === 'medium' && hosts.size < 2) errors.push(`confidence medium needs 2+ sites (has ${hosts.size})`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.researched_at)) errors.push(`researched_at must be YYYY-MM-DD`);
  return errors;
}
