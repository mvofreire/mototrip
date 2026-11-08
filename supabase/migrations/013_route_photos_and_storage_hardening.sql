-- 013: Route photos + storage hardening
--
-- 1. route_map bucket: any signed-in user could overwrite or delete any
--    route's map thumbnail. Writes are now limited to the route's author
--    (thumbnail-<route_id>.png) or an admin.
-- 2. New public route_photos bucket (JPG/PNG/WebP, max 5 MB). Files live at
--    <route_id>/<file>; only the route's author or an admin can upload.
-- 3. route_photos rows: only the route's author or an admin can add photos;
--    authors delete their own, admins delete any.

-- ---------------------------------------------------------------- route_map
DROP POLICY IF EXISTS "Authenticated users can upload thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete thumbnails" ON storage.objects;

CREATE POLICY "Route authors and admins can upload thumbnails"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'route_map' AND (
      public.is_admin() OR EXISTS (
        SELECT 1 FROM public.routes r
        WHERE storage.objects.name = 'thumbnail-' || r.id || '.png'
          AND r.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Route authors and admins can update thumbnails"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'route_map' AND (
      public.is_admin() OR EXISTS (
        SELECT 1 FROM public.routes r
        WHERE storage.objects.name = 'thumbnail-' || r.id || '.png'
          AND r.user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    bucket_id = 'route_map' AND (
      public.is_admin() OR EXISTS (
        SELECT 1 FROM public.routes r
        WHERE storage.objects.name = 'thumbnail-' || r.id || '.png'
          AND r.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Route authors and admins can delete thumbnails"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'route_map' AND (
      public.is_admin() OR EXISTS (
        SELECT 1 FROM public.routes r
        WHERE storage.objects.name = 'thumbnail-' || r.id || '.png'
          AND r.user_id = auth.uid()
      )
    )
  );

-- ------------------------------------------------------- route_photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('route_photos', 'route_photos', true, 5242880,
        ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Public can view route photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'route_photos');

CREATE POLICY "Route authors and admins can upload route photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'route_photos' AND (
      public.is_admin() OR EXISTS (
        SELECT 1 FROM public.routes r
        WHERE r.id::text = (storage.foldername(storage.objects.name))[1]
          AND r.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Uploaders and admins can delete route photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'route_photos' AND (
      owner_id = auth.uid()::text OR public.is_admin()
    )
  );

-- -------------------------------------------------------- route_photos rows
DROP POLICY IF EXISTS "Users can add photos to routes" ON public.route_photos;
DROP POLICY IF EXISTS "Users can delete own photos" ON public.route_photos;

CREATE POLICY "Route authors and admins can add photos"
  ON public.route_photos FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND (
      public.is_admin() OR EXISTS (
        SELECT 1 FROM public.routes r
        WHERE r.id = route_photos.route_id AND r.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Uploaders and admins can delete photos"
  ON public.route_photos FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());
