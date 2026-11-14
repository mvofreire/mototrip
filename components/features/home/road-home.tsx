import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import {
  ArrowRight,
  Check,
  Download,
  MapPin,
  Search,
  Map as MapIcon,
  Star,
  UserX,
} from 'lucide-react'
import { RoutesService } from '@/lib/services/routes.service'
import { localizeRoute } from '@/lib/localize'
import { REGIONS, regionForRoute, regionLabel, textFor } from '@/lib/regions'
import { routePath } from '@/lib/route-url'
import { googleMapsUrl, gpxFileName, routePoints, routeSvgPath } from '@/lib/route-export'
import { formatDuration, formatRating } from '@/lib/utils'
import type { RouteWithDetails } from '@/types'
import { HomeTracker } from './home-tracker'
import { GpxFileIcon, RoadBand, RouteLine, TopoRoute } from './road-art'

const container = 'mx-auto w-full max-w-[1240px] px-4 sm:px-6'
const eyebrow = 'text-sm font-bold uppercase tracking-[0.12em]'
const display = 'font-display font-extrabold uppercase leading-[0.95]'

/** Cinematic homepage (variant "road", prototype A) */
export async function RoadHome({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'homeRoad' })
  const tAll = await getTranslations({ locale })

  let featured: RouteWithDetails[] = []
  let stats = { routes: 0, km: 0, regions: 0 }
  let places: { country: string | null; region: string | null }[] = []
  try {
    ;[featured, stats, places] = await Promise.all([
      RoutesService.getFeaturedRoutes(3),
      RoutesService.getStats(),
      RoutesService.getPublishedPlaces(),
    ])
    if (featured.length < 3) {
      const latest = await RoutesService.getLatestRoutes(6)
      const ids = new Set(featured.map((r) => r.id))
      featured = [...featured, ...latest.filter((r) => !ids.has(r.id))].slice(0, 3)
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error)
  }

  const nf = new Intl.NumberFormat(locale)
  const routes = featured.map((r) => {
    const route = localizeRoute(r, locale)
    const points = routePoints(r.polyline_coordinates)
    const [name, via] = route.title.split('|').map((s) => s.trim())
    return {
      route,
      name,
      via: via?.replace(/>/g, '›') ?? null,
      href: routePath(locale, route),
      region: regionLabel(route, locale),
      difficulty: tAll(`difficulty.${route.difficulty}` as 'difficulty.easy'),
      km: `${nf.format(Math.round(Number(route.distance_km) || 0))} km`,
      time: route.duration_minutes ? formatDuration(route.duration_minutes) : null,
      rating: route.curator_rating ?? route.rating_average ?? null,
      cardPath: routeSvgPath(points, 380, 190, 22),
      phonePath: routeSvgPath(points, 276, 200, 24),
      gpxHref: `/api/gpx/${route.slug || route.id}?locale=${locale}`,
      mapsHref: googleMapsUrl(points),
    }
  })
  const hero = routes[0]

  // Destinations with the most routes first
  const counts = new Map<string, number>()
  for (const place of places) {
    const region = regionForRoute(place)
    if (region) counts.set(region.slug, (counts.get(region.slug) ?? 0) + 1)
  }
  const destinations = REGIONS.filter((r) => r.kind === 'region' && counts.has(r.slug))
    .sort((a, b) => counts.get(b.slug)! - counts.get(a.slug)!)
    .slice(0, 8)

  const perks = [
    { icon: Download, label: t('perks.gpx') },
    { icon: MapPin, label: t('perks.maps') },
    { icon: UserX, label: t('perks.noSignup') },
  ]

  const steps = [
    { icon: Search, title: t('how.step1Title'), desc: t('how.step1Desc') },
    { icon: MapIcon, title: t('how.step2Title'), desc: t('how.step2Desc') },
    { icon: Download, title: t('how.step3Title'), desc: t('how.step3Desc') },
  ]

  return (
    <div className="flex flex-col" data-home-variant="road">
      <HomeTracker variant="road" />

      {/* HERO */}
      <section data-home-section="hero" className="relative overflow-hidden bg-[#0d0f14] text-steel-50">
        <TopoRoute className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0f14]/95 via-[#0d0f14]/75 to-[#0d0f14]/20" />

        <div className={`${container} relative flex flex-wrap items-center gap-12 pb-24 pt-14 sm:pb-28 sm:pt-20`}>
          <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-7">
            {stats.routes > 0 && (
              <span className="inline-flex items-center gap-2 self-start rounded-full bg-brand-500/15 px-3.5 py-2 text-sm font-semibold text-brand-300">
                <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                {t('hero.badge', { routes: stats.routes, regions: stats.regions })}
              </span>
            )}
            <h1 className={`${display} text-[clamp(3rem,7vw,6rem)] !leading-[0.92]`}>
              {t('hero.title')}
              <span className="block text-brand-500">{t('hero.titleHighlight')}</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-steel-300 sm:text-xl">
              {t.rich('hero.subtitle', {
                strong: (chunks) => <strong className="text-steel-50">{chunks}</strong>,
              })}
            </p>
            <div className="flex flex-wrap gap-3.5">
              <Link
                href={`/${locale}/explore`}
                className="inline-flex min-h-[52px] items-center gap-2.5 rounded-lg bg-brand-600 px-6 font-semibold text-white transition-colors hover:bg-brand-700"
              >
                {t('hero.explore')}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href={`/${locale}/submit`}
                className="inline-flex min-h-[52px] items-center rounded-lg border border-steel-500 px-6 font-semibold text-steel-50 transition-colors hover:bg-white/5"
              >
                {t('hero.submit')}
              </Link>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-steel-200">
              {perks.map(({ icon: Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-2">
                  <Icon className="h-[18px] w-[18px] text-brand-500" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {hero && (
            <div className="road-float ml-auto flex w-full min-w-0 flex-[0_1_380px] flex-col gap-4 rounded-2xl border border-steel-800 bg-steel-900/90 p-5 shadow-[0_30px_60px_-30px_rgba(0,0,0,.8)] backdrop-blur">
              <div className="flex items-center justify-between text-[13px] text-steel-400">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-brand-500 text-brand-500" aria-hidden />
                  {t('heroCard.featured')}
                  {hero.region && ` · ${hero.region}`}
                </span>
                <span>{hero.difficulty}</span>
              </div>
              <Link href={hero.href} className="group flex flex-col gap-2">
                <span className={`${display} text-3xl leading-none group-hover:text-brand-400`}>{hero.name}</span>
                {hero.via && <span className="text-sm text-steel-300">{hero.via}</span>}
              </Link>
              <div className="grid grid-cols-3 gap-2.5 border-y border-steel-800 py-3.5">
                <div>
                  <div className={`${display} text-2xl`}>{hero.km}</div>
                  <div className="text-xs text-steel-400">{t('heroCard.distance')}</div>
                </div>
                {hero.time && (
                  <div>
                    <div className={`${display} text-2xl`}>{hero.time}</div>
                    <div className="text-xs text-steel-400">{t('heroCard.duration')}</div>
                  </div>
                )}
                {hero.rating != null && (
                  <div>
                    <div className={`${display} text-2xl`}>{formatRating(hero.rating)}</div>
                    <div className="text-xs text-steel-400">{t('heroCard.rating')}</div>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5">
                <a
                  href={hero.gpxHref}
                  download
                  rel="nofollow"
                  className="inline-flex min-h-[46px] flex-[1_1_140px] items-center justify-center gap-2 rounded-lg bg-steel-50 text-sm font-semibold text-steel-950 transition-colors hover:bg-white"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  {t('heroCard.gpx')}
                </a>
                {hero.mapsHref && (
                  <a
                    href={hero.mapsHref}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex min-h-[46px] flex-[1_1_140px] items-center justify-center gap-2 rounded-lg border border-steel-600 text-sm font-semibold text-steel-50 transition-colors hover:bg-white/5"
                  >
                    <MapPin className="h-4 w-4" aria-hidden />
                    Google Maps
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* STATS */}
      {stats.routes > 0 && (
        <section className="bg-brand-600 text-white">
          <div className={`${container} flex flex-wrap items-center justify-between gap-x-14 gap-y-5 py-7`}>
            {[
              { value: nf.format(stats.routes), label: t('stats.routes') },
              { value: nf.format(stats.km), label: t('stats.km') },
              { value: nf.format(stats.regions), label: t('stats.regions') },
              { value: t('stats.freeValue'), label: t('stats.free') },
            ].map(({ value, label }) => (
              <div key={label} className="flex items-baseline gap-3">
                <span className={`${display} text-5xl`}>{value}</span>
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section data-home-section="how" className={`${container} flex flex-col gap-14 py-20 sm:py-28`}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex max-w-2xl flex-col gap-3">
            <span className={`${eyebrow} text-brand-600 dark:text-brand-400`}>{t('how.eyebrow')}</span>
            <h2 className={`${display} text-[clamp(2.5rem,5vw,4rem)]`}>{t('how.title')}</h2>
          </div>
          <p className="max-w-md text-[17px] leading-relaxed text-muted-foreground">{t('how.notGps')}</p>
        </div>
        <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-6">
          {steps.map(({ icon: Icon, title, desc }, i) => {
            const last = i === steps.length - 1
            return (
              <li
                key={title}
                className={`flex flex-col gap-4 rounded-2xl p-8 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  last ? 'bg-steel-950 text-steel-50 dark:bg-steel-900' : 'border bg-card'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`${display} text-6xl leading-none ${last ? 'text-steel-700' : 'text-steel-200 dark:text-steel-800'}`}
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`grid h-14 w-14 place-items-center rounded-xl ${
                      last ? 'bg-brand-600 text-white' : 'bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                    }`}
                  >
                    <Icon className="h-7 w-7" aria-hidden />
                  </span>
                </div>
                <h3 className="text-[22px] font-bold">{title}</h3>
                <p className={`leading-relaxed ${last ? 'text-steel-300' : 'text-muted-foreground'}`}>{desc}</p>
              </li>
            )
          })}
        </ol>
      </section>

      {/* GPX + GOOGLE MAPS */}
      <section data-home-section="export" className="overflow-hidden bg-steel-900 text-steel-50">
        <div className={`${container} flex flex-wrap items-center gap-16 py-20 sm:py-24`}>
          <div className="relative mx-auto min-w-0 flex-[0_1_360px]">
            <div className="mx-auto w-[300px] max-w-full rounded-[42px] border border-steel-700 bg-steel-950 p-3 shadow-[0_40px_80px_-30px_rgba(0,0,0,.9)]">
              <div className="overflow-hidden rounded-[32px] bg-steel-50 text-steel-950">
                <RouteLine
                  d={hero?.phonePath ?? null}
                  width={276}
                  height={200}
                  strokeWidth={5}
                  className="block w-full"
                  label={hero?.name}
                />
                <div className="flex flex-col gap-2.5 px-4 pb-5 pt-4">
                  {hero?.region && (
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">{hero.region}</span>
                  )}
                  <span className={`${display} text-2xl leading-none`}>{hero?.name ?? 'MotoTrip'}</span>
                  {hero && (
                    <span className="flex gap-3.5 text-xs text-steel-600">
                      <span>{hero.km}</span>
                      {hero.time && <span>{hero.time}</span>}
                      <span>{hero.difficulty}</span>
                    </span>
                  )}
                  <span className="mt-1.5 flex min-h-[40px] items-center justify-center rounded-lg bg-brand-600 text-[13px] font-semibold text-white">
                    {t('export.phoneGpx')}
                  </span>
                  <span className="flex min-h-[40px] items-center justify-center rounded-lg border border-steel-300 text-[13px] font-semibold">
                    {t('export.phoneMaps')}
                  </span>
                </div>
              </div>
            </div>
            <div className="road-float absolute -left-2 top-14 flex items-center gap-2.5 rounded-xl bg-steel-50 px-3.5 py-2.5 text-[13px] font-semibold text-steel-950 shadow-[0_16px_30px_-12px_rgba(0,0,0,.6)]">
              <GpxFileIcon className="h-8 w-7" />
              {gpxFileName(hero?.name ?? 'route')}
            </div>
          </div>

          <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-6">
            <span className={`${eyebrow} text-brand-400`}>{t('export.eyebrow')}</span>
            <h2 className={`${display} text-[clamp(2.5rem,5vw,4rem)]`}>{t('export.title')}</h2>
            <p className="text-lg leading-relaxed text-steel-300">{t('export.description')}</p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-4">
              {[
                { icon: Download, title: t('export.gpxTitle'), desc: t('export.gpxDesc') },
                { icon: MapPin, title: t('export.mapsTitle'), desc: t('export.mapsDesc') },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex flex-col gap-2.5 rounded-2xl border border-steel-800 p-5">
                  <Icon className="h-7 w-7 text-brand-400" aria-hidden />
                  <h3 className="text-[17px] font-bold">{title}</h3>
                  <p className="text-[15px] leading-relaxed text-steel-300">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED ROUTES */}
      {routes.length > 0 && (
        <section data-home-section="featured" className={`${container} flex flex-col gap-10 pb-12 pt-20 sm:pt-28`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2.5">
              <span className={`${eyebrow} text-brand-600 dark:text-brand-400`}>{t('featured.eyebrow')}</span>
              <h2 className={`${display} text-[clamp(2.25rem,4.5vw,3.5rem)]`}>{t('featured.title')}</h2>
            </div>
            <Link
              href={`/${locale}/explore`}
              className="inline-flex min-h-[44px] items-center gap-2 font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              {t('featured.viewAll')}
              <ArrowRight className="h-[18px] w-[18px]" aria-hidden />
            </Link>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-6">
            {routes.map((r) => (
              <Link
                key={r.route.id}
                href={r.href}
                className="flex flex-col overflow-hidden rounded-2xl border bg-card transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <RouteLine d={r.cardPath} className="block w-full" />
                <div className="flex flex-1 flex-col gap-2.5 p-5">
                  <div className="flex justify-between gap-3 text-xs font-bold uppercase tracking-wide">
                    <span className="text-brand-600 dark:text-brand-400">{r.region}</span>
                    <span className="text-muted-foreground">{r.difficulty}</span>
                  </div>
                  <span className={`${display} text-[28px] leading-none`}>{r.name}</span>
                  {r.via && <span className="text-sm text-muted-foreground">{r.via}</span>}
                  <span className="mt-auto flex gap-4 border-t pt-3 text-sm font-semibold">
                    <span>{r.km}</span>
                    {r.time && <span>{r.time}</span>}
                    <span className="ml-auto text-brand-600 dark:text-brand-400">{t('featured.freeGpx')}</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* DESTINATIONS */}
      {destinations.length > 0 && (
        <section data-home-section="destinations" className={`${container} flex flex-col gap-7 pb-20 pt-12 sm:pb-28`}>
          <h2 className={`${display} text-[clamp(2rem,4vw,2.75rem)] leading-none`}>{t('destinations.title')}</h2>
          <ul className="flex flex-wrap gap-3">
            {destinations.map((d) => (
              <li key={d.slug}>
                <Link
                  href={`/${locale}/regions/${d.slug}`}
                  className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full border bg-card px-5 font-semibold transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  {textFor(d.name, locale)}
                  <span className="text-[13px] font-medium text-muted-foreground">
                    {t('destinations.routes', { count: counts.get(d.slug)! })}
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={`/${locale}/regions`}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-steel-950 px-5 font-semibold text-steel-50 transition-colors hover:bg-steel-800 dark:bg-steel-800 dark:hover:bg-steel-700"
              >
                {t('destinations.all')}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </li>
          </ul>
        </section>
      )}

      {/* CTA */}
      <section data-home-section="cta" className="relative overflow-hidden bg-[#0d0f14] text-steel-50">
        <RoadBand className="absolute inset-0 h-full w-full" />
        <div className="relative mx-auto flex max-w-[860px] flex-col items-center gap-6 px-4 py-24 text-center sm:py-28">
          <h2 className={`${display} text-[clamp(2.75rem,6vw,5rem)] !leading-[0.92]`}>{t('cta.title')}</h2>
          <p className="text-lg leading-relaxed text-steel-300">{t('cta.subtitle')}</p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <Link
              href={`/${locale}/explore`}
              className="inline-flex min-h-[52px] items-center rounded-lg bg-brand-600 px-7 font-semibold text-white transition-colors hover:bg-brand-700"
            >
              {t('cta.explore')}
            </Link>
            <Link
              href={`/${locale}/submit`}
              className="inline-flex min-h-[52px] items-center rounded-lg border border-steel-500 px-7 font-semibold text-steel-50 transition-colors hover:bg-white/5"
            >
              {t('cta.submit')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
