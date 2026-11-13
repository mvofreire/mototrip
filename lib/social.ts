/** Official MotoTrip social profiles. Instagram is the main channel. */
export const INSTAGRAM = {
  handle: 'mototrip.pt',
  url: 'https://www.instagram.com/mototrip.pt/',
} as const

export const FACEBOOK = {
  name: 'Mototrip.pt',
  url: 'https://www.facebook.com/profile.php?id=61596386317314',
} as const

/** Used as schema.org `sameAs` so search engines link the site and profiles */
export const SOCIAL_PROFILES = [INSTAGRAM.url, FACEBOOK.url]
