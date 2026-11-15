'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * A number that counts up when it scrolls into view. The server renders the
 * final value (search engines, no-JS, reduced motion keep it as is).
 */
export function CountUp({ value, locale, duration = 1200 }: { value: number; locale: string; duration?: number }) {
  const [shown, setShown] = useState(value)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || value <= 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const run = () => {
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, Math.max(0, (now - start) / duration))
        setShown(Math.round(value * (1 - Math.pow(1 - p, 3))))
        if (p < 1) frame = requestAnimationFrame(tick)
      }
      setShown(0)
      frame = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        io.disconnect()
        run()
      }
    })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {shown.toLocaleString(locale)}
    </span>
  )
}
