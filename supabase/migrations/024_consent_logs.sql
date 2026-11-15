-- 024: Proof of cookie consent (GDPR art. 7(1))
--
-- One row per choice made in the cookie banner: the anonymous consent id kept
-- in the visitor's cc_cookie, the accepted categories, the banner revision and
-- whether it was the first choice or a change. No IP, user agent or account.
-- Written only by /api/consent with the service role; nobody reads it from the
-- client (RLS on, no policies).

CREATE TABLE IF NOT EXISTS public.consent_logs (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  consent_id  UUID NOT NULL,
  categories  TEXT[] NOT NULL
    CHECK (categories <@ ARRAY['necessary', 'analytics', 'marketing']::TEXT[]),
  revision    INTEGER NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('first', 'change')),
  locale      TEXT NOT NULL CHECK (locale IN ('en', 'pt', 'es', 'fr', 'de')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consent_logs_consent_id ON public.consent_logs (consent_id);

ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;
