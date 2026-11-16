-- 030: profile photos
--
-- New public avatars bucket. The browser crops the picked image to a square
-- 512×512 WebP (lib/images/avatar.ts), so files are tens of KB; the 2 MB
-- limit only stops raw uploads. Each user owns one file: <user id>/avatar.webp,
-- overwritten on change (profiles.avatar_url carries ?v= to bust caches).
--
-- Public URLs work without a SELECT policy, so the bucket can't be listed;
-- the SELECT policy below only lets a user see their own folder, which
-- upsert (overwrite) needs. The "Active users only (upload)" restrictive
-- policy from 016 also applies here.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 2097152, ARRAY['image/webp', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Users read own avatar folder"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users and staff delete avatars"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR public.is_staff()
    )
  );
