/** Absolute site origin, tolerant of NEXT_PUBLIC_SITE_URL set without a protocol. */
export function getSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mototrip.pt').trim().replace(/\/+$/, '')
  return /^https?:\/\//.test(raw) ? raw : `https://${raw}`
}
