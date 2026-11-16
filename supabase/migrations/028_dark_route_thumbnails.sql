-- Route thumbnails now come in two themes: thumbnail-<route_id>.png (light,
-- also the social/OG image) and thumbnail-<route_id>-dark.png (dark map, shown
-- in the dark theme). Route authors may write both of their route's files;
-- staff keep writing any. Same rules as 014 otherwise.

DROP POLICY IF EXISTS "Route authors and staff can upload thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Route authors and staff can update thumbnails" ON storage.objects;

CREATE POLICY "Route authors and staff can upload thumbnails"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'route_map' AND (
      public.is_staff() OR EXISTS (
        SELECT 1 FROM public.routes r
        WHERE storage.objects.name IN ('thumbnail-' || r.id || '.png', 'thumbnail-' || r.id || '-dark.png')
          AND r.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Route authors and staff can update thumbnails"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'route_map' AND (
      public.is_staff() OR EXISTS (
        SELECT 1 FROM public.routes r
        WHERE storage.objects.name IN ('thumbnail-' || r.id || '.png', 'thumbnail-' || r.id || '-dark.png')
          AND r.user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    bucket_id = 'route_map' AND (
      public.is_staff() OR EXISTS (
        SELECT 1 FROM public.routes r
        WHERE storage.objects.name IN ('thumbnail-' || r.id || '.png', 'thumbnail-' || r.id || '-dark.png')
          AND r.user_id = auth.uid()
      )
    )
  );
