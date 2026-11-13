-- 023: Blog post covers can be an uploaded image, not only a route map
--
-- Posts like "preparing the bike before a trip" or "riding rules in Europe"
-- have no main route, so the cover is now either:
--   cover_route_id   → the route's map thumbnail (as before), or
--   cover_image_url  → an image uploaded to the blog_images bucket
-- never both. cover_image_credit holds the photo credit shown under it
-- (e.g. "Foto: Ana Silva / Unsplash").
--
-- New public blog_images bucket (JPG/PNG/WebP, max 5 MB) for covers and images
-- inside posts; only staff (admin or curator) upload or delete.

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT
    CHECK (cover_image_url IS NULL OR (cover_image_url ~ '^https://' AND length(cover_image_url) <= 500)),
  ADD COLUMN IF NOT EXISTS cover_image_credit TEXT
    CHECK (cover_image_credit IS NULL OR length(cover_image_credit) <= 200);

ALTER TABLE public.blog_posts DROP CONSTRAINT IF EXISTS blog_posts_one_cover;
ALTER TABLE public.blog_posts
  ADD CONSTRAINT blog_posts_one_cover CHECK (cover_route_id IS NULL OR cover_image_url IS NULL);

-- --------------------------------------------------------- blog_images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('blog_images', 'blog_images', true, 5242880,
        ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view blog images" ON storage.objects;
CREATE POLICY "Public can view blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog_images');

DROP POLICY IF EXISTS "Staff upload blog images" ON storage.objects;
CREATE POLICY "Staff upload blog images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blog_images' AND public.is_staff());

DROP POLICY IF EXISTS "Staff update blog images" ON storage.objects;
CREATE POLICY "Staff update blog images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'blog_images' AND public.is_staff())
  WITH CHECK (bucket_id = 'blog_images' AND public.is_staff());

DROP POLICY IF EXISTS "Staff delete blog images" ON storage.objects;
CREATE POLICY "Staff delete blog images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'blog_images' AND public.is_staff());
