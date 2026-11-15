import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import { RegionNetworkThumb } from './region-network'

export interface DestinationCardData {
  slug: string
  href: string
  name: string
  countryName: string
  flag?: string
  intro: string
  count: number
  km: number
  /** SVG paths of its routes on a shared projection (360×170) */
  paths: string[]
  top: { id: string; title: string; href: string }[]
}

export interface DestinationCardLabels {
  routes: string
  km: string
  view: string
  empty: string
  submit: string
  submitHref: string
}

/** Region tile: route preview that redraws on hover, name, intro, top routes */
export function DestinationCard({ data, labels, index = 0 }: { data: DestinationCardData; labels: DestinationCardLabels; index?: number }) {
  return (
    <article
      style={{ '--i': index } as React.CSSProperties}
      className="dest-card group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition duration-300 hover:-translate-y-1 hover:border-[hsl(var(--primary)/0.5)] hover:shadow-[0_24px_48px_-28px_hsl(var(--primary)/0.55)] focus-within:border-[hsl(var(--primary)/0.5)]"
    >
      <div className="relative aspect-[36/17] overflow-hidden">
        <RegionNetworkThumb paths={data.paths} className="h-full w-full transition-transform duration-700 group-hover:scale-[1.04]" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          {data.flag && <span aria-hidden>{data.flag}</span>}
          {labels.routes}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{data.countryName}</p>
          <h3 className="font-display text-2xl font-extrabold uppercase leading-none">
            <Link
              href={data.href}
              className="after:absolute after:inset-0 after:content-[''] group-hover:text-primary focus-visible:outline-none"
            >
              {data.name}
            </Link>
          </h3>
        </div>
        {data.intro && <p className="line-clamp-2 text-sm text-muted-foreground">{data.intro}</p>}

        {data.top.length > 0 ? (
          <ul className="relative z-10 flex flex-col gap-1 border-t pt-3 text-sm">
            {data.top.map((r) => (
              <li key={r.id}>
                <Link href={r.href} className="flex items-center gap-2 rounded py-0.5 hover:text-primary">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  <span className="truncate">{r.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="relative z-10 border-t pt-3 text-sm text-muted-foreground">
            {labels.empty}{' '}
            <Link href={labels.submitHref} className="font-medium text-primary hover:underline">
              {labels.submit}
            </Link>
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-1 text-sm">
          {data.km > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {labels.km}
            </span>
          ) : (
            <span />
          )}
          <span className="inline-flex items-center gap-1 font-semibold text-primary">
            {labels.view}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </div>
    </article>
  )
}
