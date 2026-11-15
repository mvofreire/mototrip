/**
 * Cookie consent (vanilla-cookieconsent) + Google Consent Mode v2.
 *
 * Categories:
 *   necessary → always on (session, preferences, the consent cookie itself)
 *   analytics → analytics_storage (GA4)
 *   marketing → ad_storage, ad_user_data, ad_personalization (Google Ads, Meta Pixel)
 *
 * Vercel Analytics sets no cookies and identifies no one, so it runs without
 * consent. Everything loaded through GTM must be gated on these categories.
 */

/** Bump when the categories or the tools behind them change: everyone is asked again */
export const CONSENT_REVISION = 1

/** Cookie where vanilla-cookieconsent stores the choice */
export const CONSENT_COOKIE = 'cc_cookie'

export const CONSENT_CATEGORIES = ['necessary', 'analytics', 'marketing'] as const
export type ConsentCategory = (typeof CONSENT_CATEGORIES)[number]

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || ''

type ConsentState = 'granted' | 'denied'

/** Consent Mode v2 signals for the accepted categories */
export function consentModeState(categories: readonly string[]): Record<string, ConsentState> {
  const analytics: ConsentState = categories.includes('analytics') ? 'granted' : 'denied'
  const marketing: ConsentState = categories.includes('marketing') ? 'granted' : 'denied'
  return {
    analytics_storage: analytics,
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
  }
}

/**
 * Inline script that must run before GTM: everything denied by default, then
 * the visitor's saved choice (if any) restored at once, so tags on a returning
 * visitor's first page don't wait for the banner script to load.
 */
export const CONSENT_DEFAULTS_SCRIPT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
  analytics_storage: 'denied', functionality_storage: 'granted', security_storage: 'granted',
  wait_for_update: 500
});
gtag('set', 'ads_data_redaction', true);
try {
  var m = document.cookie.match(/(?:^|; )${CONSENT_COOKIE}=([^;]*)/);
  var saved = m && JSON.parse(decodeURIComponent(m[1]));
  if (saved && saved.revision === ${CONSENT_REVISION} && Array.isArray(saved.categories)) {
    var a = saved.categories.indexOf('analytics') > -1 ? 'granted' : 'denied';
    var k = saved.categories.indexOf('marketing') > -1 ? 'granted' : 'denied';
    gtag('consent', 'update', { analytics_storage: a, ad_storage: k, ad_user_data: k, ad_personalization: k });
  }
} catch (e) {}
`

/** Standard GTM loader (runs after the defaults above) */
export function gtmScript(id: string) {
  return `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`
}

type DataLayerWindow = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
}

/** Push an object to GTM's dataLayer (no-op on the server) */
export function pushDataLayer(entry: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  const w = window as DataLayerWindow
  ;(w.dataLayer ??= []).push(entry)
}

/**
 * Tell Consent Mode about the visitor's choice and fire a
 * `cookie_consent_update` event, which GTM tags can use as their trigger.
 */
export function applyConsent(categories: readonly string[]) {
  if (typeof window === 'undefined') return
  const w = window as DataLayerWindow
  // Defined by CONSENT_DEFAULTS_SCRIPT; GTM only reads real `arguments` objects
  w.gtag ??= function gtag() {
    // eslint-disable-next-line prefer-rest-params
    ;(w.dataLayer ??= []).push(arguments)
  }
  w.gtag('consent', 'update', consentModeState(categories))
  pushDataLayer({
    event: 'cookie_consent_update',
    consent_analytics: categories.includes('analytics'),
    consent_marketing: categories.includes('marketing'),
  })
}
