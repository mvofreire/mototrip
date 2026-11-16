'use client'

/**
 * Small SVG charts for the admin dashboard (no chart library). One y-axis per
 * chart, thin marks, recessive grid, hover tooltip on every chart with a plot.
 * Series colors come from --chart-1..5 (globals.css), always in that order.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export const SERIES = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

function niceMax(v: number) {
  if (v <= 4) return 4
  const p = Math.pow(10, Math.floor(Math.log10(v)))
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p
  return 10 * p
}

const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n % 1000 ? 1 : 0)}k` : String(Math.round(n)))

function Tooltip({ x, y, width, children }: { x: number; y: number; width: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(140)
  useEffect(() => {
    if (ref.current) setW(ref.current.offsetWidth)
  })
  return (
    <div
      ref={ref}
      className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-md"
      style={{ left: Math.min(Math.max(0, x - w / 2), Math.max(0, width - w)), top: y, transform: 'translateY(calc(-100% - 8px))' }}
    >
      {children}
    </div>
  )
}

const Swatch = ({ color }: { color: string }) => <span className="inline-block h-2 w-2 shrink-0 rounded-[2px]" style={{ background: color }} />

export function Legend({ items }: { items: { label: string; color: string; value?: ReactNode }[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <Swatch color={i.color} />
          {i.label}
          {i.value != null && <strong className="font-semibold tabular-nums text-foreground">{i.value}</strong>}
        </span>
      ))}
    </div>
  )
}

interface Series {
  name: string
  data: number[]
  color: string
}

/** Line chart over days; series share one unit. `bare` = sparkline (no axes, no hover) */
export function LineChart({ labels, series, height = 220, bare }: { labels: string[]; series: Series[]; height?: number; bare?: boolean }) {
  const [ref, W] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const padL = bare ? 2 : 32
  const padR = bare ? 2 : 8
  const padT = bare ? 3 : 8
  const padB = bare ? 3 : 22
  const n = labels.length
  const max = niceMax(Math.max(1, ...series.flatMap((s) => s.data)) * 1.05)
  const x = (i: number) => padL + (n > 1 ? (i * (W - padL - padR)) / (n - 1) : 0)
  const y = (v: number) => padT + (height - padT - padB) * (1 - v / max)
  const path = (d: number[]) => d.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  // Whole-number gridlines: 4 or 5 steps, whichever divides the axis evenly
  const steps = max % 4 === 0 ? 4 : max % 5 === 0 ? 5 : 2
  const ticks = Array.from({ length: steps + 1 }, (_, i) => (max * i) / steps)
  // As many date labels as fit (about 56px each), spread evenly from first to last
  const fit = Math.max(2, Math.min(n, Math.floor((W - padL - padR) / 56)))
  const shown = new Set(n > 1 ? Array.from({ length: fit }, (_, k) => Math.round((k * (n - 1)) / (fit - 1))) : [0])

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {W > 0 && (
        <svg width={W} height={height} className="block overflow-visible" role="img" aria-label={series.map((s) => s.name).join(', ')}>
          {!bare &&
            ticks.map((v) => (
              <g key={v}>
                <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="var(--chart-grid)" />
                <text x={padL - 6} y={y(v) + 4} textAnchor="end" className="fill-muted-foreground text-[10px] tabular-nums">
                  {compact(v)}
                </text>
              </g>
            ))}
          {!bare &&
            labels.map((l, i) =>
              shown.has(i) ? (
                <text
                  key={i}
                  x={x(i)}
                  y={height - 6}
                  textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
                  className="fill-muted-foreground text-[10px]"
                >
                  {l}
                </text>
              ) : null,
            )}
          {series.length === 1 && (
            <path d={`${path(series[0].data)} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={series[0].color} opacity={0.12} />
          )}
          {series.map((s) => (
            <path key={s.name} d={path(s.data)} fill="none" stroke={s.color} strokeWidth={bare ? 1.5 : 2} strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {!bare && hover != null && (
            <>
              <line x1={x(hover)} x2={x(hover)} y1={padT} y2={height - padB} stroke="currentColor" className="text-muted-foreground" strokeDasharray="3 3" />
              {series.map((s) => (
                <circle key={s.name} cx={x(hover)} cy={y(s.data[hover])} r={4} fill={s.color} stroke="hsl(var(--card))" strokeWidth={2} />
              ))}
            </>
          )}
          {!bare && (
            <rect
              x={padL}
              y={0}
              width={Math.max(0, W - padL - padR)}
              height={height}
              fill="transparent"
              onPointerMove={(e) => {
                const bx = e.clientX - e.currentTarget.getBoundingClientRect().left
                setHover(Math.max(0, Math.min(n - 1, Math.round((bx / (W - padL - padR)) * (n - 1)))))
              }}
              onPointerLeave={() => setHover(null)}
            />
          )}
        </svg>
      )}
      {!bare && hover != null && (
        <Tooltip x={x(hover)} y={Math.min(...series.map((s) => y(s.data[hover])))} width={W}>
          <div className="mb-0.5 font-medium text-muted-foreground">{labels[hover]}</div>
          {series.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5">
              <Swatch color={s.color} />
              {s.name}: <strong className="tabular-nums">{s.data[hover]}</strong>
            </div>
          ))}
        </Tooltip>
      )}
    </div>
  )
}

/** Stacked columns (e.g. new routes per month by category) */
export function StackedColumns({ labels, groups, height = 180, totalLabel }: {
  labels: string[]
  groups: Series[]
  height?: number
  totalLabel: (total: number) => string
}) {
  const [ref, W] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const padL = 28
  const padB = 22
  const padT = 6
  const totals = labels.map((_, i) => groups.reduce((a, g) => a + g.data[i], 0))
  const max = niceMax(Math.max(1, ...totals) * 1.05)
  const step = labels.length ? (W - padL) / labels.length : 0
  const bw = Math.min(40, step * 0.56)
  const y = (v: number) => padT + (height - padT - padB) * (1 - v / max)

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {W > 0 && (
        <svg width={W} height={height} className="block" role="img">
          {[0, 0.5, 1].map((f) => (
            <g key={f}>
              <line x1={padL} x2={W} y1={y(max * f)} y2={y(max * f)} stroke="var(--chart-grid)" />
              <text x={padL - 6} y={y(max * f) + 4} textAnchor="end" className="fill-muted-foreground text-[10px] tabular-nums">
                {compact(max * f)}
              </text>
            </g>
          ))}
          {labels.map((l, i) => {
            const cx = padL + step * i + step / 2
            let acc = 0
            const top = groups.reduce((k, g, j) => (g.data[i] > 0 ? j : k), -1)
            return (
              <g key={l} opacity={hover == null || hover === i ? 1 : 0.55}>
                {groups.map((g, j) => {
                  const v = g.data[i]
                  if (!v) return null
                  const y0 = y(acc)
                  acc += v
                  const y1 = y(acc)
                  const h = Math.max(1, y0 - y1 - (j === 0 ? 0 : 2))
                  const r = j === top ? Math.min(4, h) : 0
                  return (
                    <path
                      key={g.name}
                      fill={g.color}
                      d={`M${cx - bw / 2},${y1 + h} V${y1 + r} Q${cx - bw / 2},${y1} ${cx - bw / 2 + r},${y1} H${cx + bw / 2 - r} Q${cx + bw / 2},${y1} ${cx + bw / 2},${y1 + r} V${y1 + h} Z`}
                    />
                  )
                })}
                <text x={cx} y={height - 6} textAnchor="middle" className="fill-muted-foreground text-[10px]">
                  {l}
                </text>
                <rect x={cx - step / 2} y={0} width={step} height={height - padB} fill="transparent" onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} />
              </g>
            )
          })}
        </svg>
      )}
      {hover != null && (
        <Tooltip x={padL + step * hover + step / 2} y={y(totals[hover])} width={W}>
          <div className="mb-0.5 font-medium text-muted-foreground">
            {labels[hover]} · {totalLabel(totals[hover])}
          </div>
          {[...groups].reverse().map((g) => (
            <div key={g.name} className="flex items-center gap-1.5">
              <Swatch color={g.color} />
              {g.name}: <strong className="tabular-nums">{g.data[hover]}</strong>
            </div>
          ))}
        </Tooltip>
      )}
    </div>
  )
}

/** Horizontal bars, one hue, value at the end */
export function HBars({ data, color = 'hsl(var(--primary))' }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="space-y-1.5">
      {data.map((d) => (
        <div key={d.label} className="group grid grid-cols-[minmax(0,7rem)_1fr_2.5rem] items-center gap-2 text-xs" title={`${d.label}: ${d.value}`}>
          <span className="truncate text-muted-foreground group-hover:text-foreground">{d.label}</span>
          <div className="h-2.5">
            <div className="h-full rounded-r transition-[filter] group-hover:brightness-110" style={{ width: `${(d.value / max) * 100}%`, background: color, minWidth: d.value ? 2 : 0 }} />
          </div>
          <span className="text-right tabular-nums">{d.value}</span>
        </div>
      ))}
    </div>
  )
}

/** Proportions of a whole as one segmented bar; colors carry status, so each segment also has an icon in the legend */
export function SegmentBar({ segments, className }: { segments: { label: string; value: number; color: string; icon?: ReactNode }[]; className?: string }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1
  return (
    <div className={className}>
      <div className="flex h-3.5 gap-0.5 overflow-hidden rounded" role="img" aria-label={segments.map((s) => `${s.label} ${s.value}`).join(', ')}>
        {segments.filter((s) => s.value > 0).map((s) => (
          <div key={s.label} title={`${s.label}: ${s.value}`} style={{ width: `${(s.value / total) * 100}%`, background: s.color }} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {segments.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5">
            {s.icon}
            <Swatch color={s.color} />
            {s.label} <strong className="tabular-nums text-foreground">{s.value}</strong>
          </span>
        ))}
      </div>
    </div>
  )
}

export function ChartCard({ title, hint, actions, children, className }: { title: ReactNode; hint?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('min-w-0 rounded-xl border bg-card p-4', className)}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-sans text-sm font-semibold normal-case tracking-normal">{title}</h2>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        {actions}
      </div>
      {children}
    </section>
  )
}
