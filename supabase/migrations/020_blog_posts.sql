-- 020: Blog posts in the database, edited in the admin
--
-- blog_posts              = one row per post (slug, status, cover route, dates)
-- blog_post_translations  = one row per language (title, description, Markdown body)
--
-- status: draft | published | archived ("deactivated": off the site, kept in the admin).
-- The slug is the URL and is shared by all languages. It can change while the
-- post is a draft and is fixed once the post has left draft (published or
-- deactivated after publishing).
--
-- Access: anyone reads published posts; staff (admin or curator, is_staff())
-- read everything and create, edit, deactivate and delete posts.

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(slug) <= 100),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  cover_route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL DEFAULT auth.uid(),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published_at
  ON public.blog_posts (status, published_at DESC);

CREATE TABLE IF NOT EXISTS public.blog_post_translations (
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('pt', 'en', 'es', 'fr', 'de')),
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT NOT NULL DEFAULT '',
  body_md TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, locale)
);

-- ------------------------------------------------------------- triggers

CREATE OR REPLACE FUNCTION public.blog_posts_before_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.slug IS DISTINCT FROM OLD.slug AND OLD.status <> 'draft' THEN
      RAISE EXCEPTION 'The slug of a published post cannot change';
    END IF;
    NEW.created_at := OLD.created_at;
    NEW.author_id := OLD.author_id;
  END IF;
  IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at := now();
  END IF;
  NEW.updated_at := now();
  NEW.updated_by := coalesce(auth.uid(), NEW.updated_by);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_blog_posts_before_write ON public.blog_posts;
CREATE TRIGGER trigger_blog_posts_before_write
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.blog_posts_before_write();

-- Editing a translation bumps the post's updated_at (sitemap lastmod)
CREATE OR REPLACE FUNCTION public.blog_post_translations_before_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_blog_post_translations_before_update ON public.blog_post_translations;
CREATE TRIGGER trigger_blog_post_translations_before_update
  BEFORE UPDATE ON public.blog_post_translations
  FOR EACH ROW EXECUTE FUNCTION public.blog_post_translations_before_update();

CREATE OR REPLACE FUNCTION public.blog_post_translations_touch_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.blog_posts SET updated_at = now() WHERE id = NEW.post_id;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_blog_post_translations_touch_post ON public.blog_post_translations;
CREATE TRIGGER trigger_blog_post_translations_touch_post
  AFTER INSERT OR UPDATE ON public.blog_post_translations
  FOR EACH ROW EXECUTE FUNCTION public.blog_post_translations_touch_post();

-- ------------------------------------------------------------------ RLS

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published posts are public, staff see all" ON public.blog_posts;
CREATE POLICY "Published posts are public, staff see all"
  ON public.blog_posts FOR SELECT
  USING (status = 'published' OR public.is_staff());

DROP POLICY IF EXISTS "Staff manage posts" ON public.blog_posts;
CREATE POLICY "Staff manage posts"
  ON public.blog_posts FOR ALL
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Translations of visible posts are readable" ON public.blog_post_translations;
CREATE POLICY "Translations of visible posts are readable"
  ON public.blog_post_translations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.blog_posts p
    WHERE p.id = post_id AND (p.status = 'published' OR public.is_staff())
  ));

DROP POLICY IF EXISTS "Staff manage translations" ON public.blog_post_translations;
CREATE POLICY "Staff manage translations"
  ON public.blog_post_translations FOR ALL
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

GRANT SELECT ON public.blog_posts, public.blog_post_translations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts, public.blog_post_translations TO authenticated;
