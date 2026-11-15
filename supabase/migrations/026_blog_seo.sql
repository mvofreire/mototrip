-- 026: SEO meta tags per blog post language
--
-- Each translation can override what search engines and link previews show:
--   meta_title        → <title> and og:title (empty = the post title)
--   meta_description  → meta description and og:description (empty = the post description)
--   keywords          → meta keywords; the first one is the main keyword the
--                       admin's SEO checklist looks for in the title and description
--
-- Existing RLS on blog_post_translations (migration 020) already covers the
-- new columns: anyone reads published posts, staff write.

ALTER TABLE public.blog_post_translations
  ADD COLUMN IF NOT EXISTS meta_title TEXT NOT NULL DEFAULT ''
    CHECK (length(meta_title) <= 120),
  ADD COLUMN IF NOT EXISTS meta_description TEXT NOT NULL DEFAULT ''
    CHECK (length(meta_description) <= 320),
  ADD COLUMN IF NOT EXISTS keywords TEXT[] NOT NULL DEFAULT '{}'
    CHECK (cardinality(keywords) <= 20);
