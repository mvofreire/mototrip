import Image from 'next/image'
import { cn } from '@/lib/utils'

/** Up to two initials from a name ("Rui Almeida" → "RA") */
export function initials(name: string | null | undefined, fallback = '?') {
  const letters = (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
  return (letters || fallback).toUpperCase()
}

/**
 * Google sign-ups keep the photo URL Google sent (migration 015), which ends in
 * `=s96-c`: a 96px square. Google serves any size from the same URL, so ask
 * for one sharp enough at 2× (the optimizer then shrinks it per `sizes`).
 */
export function sizedAvatarUrl(src: string, size: number) {
  if (!src.startsWith('https://lh3.googleusercontent.com/')) return src
  const px = Math.min(512, size * 2)
  return /=s\d+(-c)?$/.test(src) ? src.replace(/=s\d+(-c)?$/, `=s${px}-c`) : src
}

/**
 * Round profile photo, or the initials on the brand gradient. Fixed size so it
 * never shifts the layout. `size` is the largest rendered size in px; pass
 * `sizes` and width/height classes when it changes per breakpoint, so one
 * image file covers all of them.
 */
export function ProfileAvatar({
  src,
  name,
  size,
  sizes,
  priority = false,
  className,
}: {
  src: string | null | undefined
  name: string | null | undefined
  size: number
  sizes?: string
  priority?: boolean
  className?: string
}) {
  return (
    <span
      className={cn('relative block shrink-0 overflow-hidden rounded-full bg-muted [container-type:inline-size]', className)}
      style={sizes ? undefined : { width: size, height: size }}
    >
      {src ? (
        <Image
          src={sizedAvatarUrl(src, size)}
          alt=""
          width={size}
          height={size}
          sizes={sizes ?? `${size}px`}
          priority={priority}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="bg-gradient-brand flex h-full w-full items-center justify-center font-display font-extrabold uppercase"
          style={{ fontSize: '38cqi' }}
        >
          {initials(name)}
        </span>
      )}
    </span>
  )
}
