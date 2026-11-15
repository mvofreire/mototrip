'use client'

import { useEffect, useRef } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import * as CookieConsent from 'vanilla-cookieconsent'
import 'vanilla-cookieconsent/dist/cookieconsent.css'
import { CONSENT_COOKIE, CONSENT_REVISION, applyConsent } from '@/lib/consent'

type CookieValue = CookieConsent.CookieValue

/** Proof of consent: kept server-side with the anonymous consent id (no IP) */
function logConsent(cookie: CookieValue, action: 'first' | 'change', locale: string) {
  fetch('/api/consent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      consentId: cookie.consentId,
      categories: cookie.categories,
      revision: cookie.revision,
      action,
      locale,
    }),
  }).catch(() => {
    // Not critical for the visitor; the choice is still applied
  })
}

/**
 * The cookie banner and preferences modal. Asks once (again when
 * CONSENT_REVISION changes) and passes the choice to Consent Mode / GTM.
 * Rendered only when GTM is configured: without it nothing needs consent.
 */
export function CookieConsentBanner() {
  const locale = useLocale()
  const t = useTranslations('cookieConsent')
  const started = useRef(false)

  useEffect(() => {
    const privacy = `<a href="/${locale}/privacy">${t('privacyLink')}</a>`

    // A language switch: rebuild the modals in the new language, keep the choice
    if (started.current) CookieConsent.reset(false)
    started.current = true

    void CookieConsent.run({
      revision: CONSENT_REVISION,
      cookie: { name: CONSENT_COOKIE, expiresAfterDays: 182 },
      guiOptions: {
        consentModal: { layout: 'box', position: 'bottom left', equalWeightButtons: true, flipButtons: false },
        preferencesModal: { layout: 'box', equalWeightButtons: true, flipButtons: false },
      },
      categories: {
        necessary: { enabled: true, readOnly: true },
        analytics: { autoClear: { cookies: [{ name: /^_ga/ }, { name: '_gid' }] } },
        marketing: { autoClear: { cookies: [{ name: /^_fb/ }, { name: /^_gcl/ }] } },
      },
      onConsent: ({ cookie }) => applyConsent(cookie.categories),
      onFirstConsent: ({ cookie }) => logConsent(cookie, 'first', locale),
      onChange: ({ cookie }) => {
        applyConsent(cookie.categories)
        logConsent(cookie, 'change', locale)
      },
      language: {
        default: locale,
        translations: {
          [locale]: {
            consentModal: {
              title: t('banner.title'),
              description: t('banner.description'),
              acceptAllBtn: t('acceptAll'),
              acceptNecessaryBtn: t('rejectAll'),
              showPreferencesBtn: t('banner.preferences'),
              footer: privacy,
            },
            preferencesModal: {
              title: t('preferences.title'),
              acceptAllBtn: t('acceptAll'),
              acceptNecessaryBtn: t('rejectAll'),
              savePreferencesBtn: t('preferences.save'),
              closeIconLabel: t('preferences.close'),
              sections: [
                { description: t('preferences.intro') },
                {
                  title: t('preferences.necessary.title'),
                  description: t('preferences.necessary.description'),
                  linkedCategory: 'necessary',
                },
                {
                  title: t('preferences.analytics.title'),
                  description: t('preferences.analytics.description'),
                  linkedCategory: 'analytics',
                },
                {
                  title: t('preferences.marketing.title'),
                  description: t('preferences.marketing.description'),
                  linkedCategory: 'marketing',
                },
                { title: t('preferences.more.title'), description: `${t('preferences.more.description')} ${privacy}` },
              ],
            },
          },
        },
      },
    })
  }, [locale, t])

  return null
}

/** Reopens the preferences (footer link "Cookie preferences") */
export function showCookiePreferences() {
  CookieConsent.showPreferences()
}
