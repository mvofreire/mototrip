'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { track } from '@vercel/analytics'

type Props = ComponentProps<typeof Link> & {
  /** Vercel Analytics custom event sent on click */
  event: string
  data?: Record<string, string | number | null>
}

/**
 * A normal Next link (rendered on the server, crawlable) that also records a
 * Vercel Analytics event, so we can see which blog links readers follow.
 */
export function TrackedLink({ event, data, onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        track(event, data)
        onClick?.(e)
      }}
    />
  )
}
