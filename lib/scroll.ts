/** Height of the sticky site header (Tailwind `top-16`) */
export const HEADER_OFFSET = 64

function behavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

/** Scrolls the page back to the top (e.g. after a form is replaced by a message) */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: behavior() })
}

/**
 * Brings `el` to just below the sticky header, but only when the page is
 * scrolled past it: a tab bar that is still in view stays where it is.
 */
export function scrollBelowHeader(el: HTMLElement | null, offset = HEADER_OFFSET) {
  if (!el) return
  const top = el.getBoundingClientRect().top
  if (top > offset + 1) return
  window.scrollTo({ top: window.scrollY + top - offset, behavior: 'auto' })
}
