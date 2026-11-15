import Script from 'next/script'
import { CONSENT_DEFAULTS_SCRIPT, GTM_ID, gtmScript } from '@/lib/consent'

/**
 * Consent Mode defaults (inline, parsed before anything else runs) and the
 * Google Tag Manager container. Without NEXT_PUBLIC_GTM_ID nothing is loaded.
 */
export function ConsentScripts() {
  if (!GTM_ID) return null
  return (
    <>
      <script id="consent-defaults" dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULTS_SCRIPT }} />
      <Script id="gtm" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: gtmScript(GTM_ID) }} />
    </>
  )
}
