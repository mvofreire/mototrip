-- 014: Curator role + route review workflow
--
-- Roles
--   admin       — everything, incl. deleting routes and managing user roles
--   curator     — reviews (approve/reject), edits any route, removes any
--                 photo/comment, features routes
--   contributor — submits routes and edits their own (default for sign-ups)
--
-- Routes
--   status: pending | approved | rejected (+ review_note, reviewed_by/at).
--   `published` is kept for existing queries and is always status = 'approved'.
--   New routes from non-staff start pending; when a non-staff author edits a
--   route (or its stops/photos) it goes back to pending.
--
-- Access
--   is_staff() = admin or curator. Staff replaces is_admin() in review/edit
--   policies; deleting routes stays admin-only.

-- ------------------------------------------------------------------- roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'curator', 'contributor'));

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'curator')
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.is_staff() TO anon, authenticated;

-- Admins switch users between contributor and curator. The admin role itself
-- is never granted or removed from the app (only directly in the database).
CREATE OR REPLACE FUNCTION public.admin_set_user_role(target_user UUID, new_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;
  IF new_role NOT IN ('contributor', 'curator') THEN
    RAISE EXCEPTION 'invalid role %', new_role USING ERRCODE = '22023';
  END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user AND role = 'admin') THEN
    RAISE EXCEPTION 'cannot change the role of an admin' USING ERRCODE = '42501';
  END IF;
  UPDATE public.profiles SET role = new_role WHERE id = target_user;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'user not found' USING ERRCODE = 'P0002';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_user_role(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(UUID, TEXT) TO authenticated;

-- ------------------------------------------------------------ route status
ALTER TABLE public.routes
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS review_note TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

ALTER TABLE public.routes ALTER COLUMN published SET DEFAULT FALSE;

UPDATE public.routes
  SET status = CASE WHEN published THEN 'approved' ELSE 'pending' END;

CREATE INDEX IF NOT EXISTS idx_routes_status ON public.routes(status);

-- Guards the review columns and keeps `published` in sync with `status`.
CREATE OR REPLACE FUNCTION public.routes_review_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  review_cols TEXT[] := ARRAY[
    'status', 'published', 'featured', 'review_note', 'reviewed_by',
    'reviewed_at', 'updated_at', 'thumbnail_url'
  ];
BEGIN
  -- Service role / SQL (import jobs): trust the caller, derive status from
  -- `published` when only that was given.
  IF auth.uid() IS NULL THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.published THEN NEW.status := 'approved'; END IF;
    ELSIF NEW.published IS DISTINCT FROM OLD.published AND NEW.status = OLD.status THEN
      NEW.status := CASE WHEN NEW.published THEN 'approved' ELSE 'pending' END;
    END IF;

  -- Admins and curators may review
  ELSIF public.is_staff() THEN
    IF TG_OP = 'UPDATE' AND NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      NEW.user_id := OLD.user_id;
    END IF;
    IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
      IF NEW.status IN ('approved', 'rejected') THEN
        NEW.reviewed_by := auth.uid();
        NEW.reviewed_at := NOW();
      ELSE
        NEW.reviewed_by := NULL;
        NEW.reviewed_at := NULL;
      END IF;
      IF NEW.status <> 'rejected' THEN
        NEW.review_note := NULL;
      END IF;
    END IF;

  -- Contributors (route authors)
  ELSE
    IF TG_OP = 'INSERT' THEN
      NEW.status := 'pending';
      NEW.featured := FALSE;
      NEW.review_note := NULL;
      NEW.reviewed_by := NULL;
      NEW.reviewed_at := NULL;
    ELSE
      NEW.user_id := OLD.user_id;
      NEW.featured := OLD.featured;
      NEW.review_note := OLD.review_note;
      NEW.reviewed_by := OLD.reviewed_by;
      NEW.reviewed_at := OLD.reviewed_at;
      -- Authors can only send a route (back) to review
      IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'pending' THEN
        NEW.status := OLD.status;
      END IF;
      -- Any content change sends the route back to review
      IF (to_jsonb(NEW) - review_cols) IS DISTINCT FROM (to_jsonb(OLD) - review_cols) THEN
        NEW.status := 'pending';
      END IF;
      IF NEW.status = 'pending' AND OLD.status <> 'pending' THEN
        NEW.review_note := NULL;
        NEW.reviewed_by := NULL;
        NEW.reviewed_at := NULL;
      END IF;
    END IF;
  END IF;

  NEW.published := (NEW.status = 'approved');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_routes_review_guard ON public.routes;
CREATE TRIGGER trigger_routes_review_guard
  BEFORE INSERT OR UPDATE ON public.routes
  FOR EACH ROW EXECUTE FUNCTION public.routes_review_guard();

-- Changes to stops/photos by a non-staff author send the route back to review
CREATE OR REPLACE FUNCTION public.route_child_changed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rid UUID := COALESCE(NEW.route_id, OLD.route_id);
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_staff() THEN
    UPDATE public.routes
      SET status = 'pending'
      WHERE id = rid AND status <> 'pending';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trigger_route_stops_changed ON public.route_stops;
CREATE TRIGGER trigger_route_stops_changed
  AFTER INSERT OR UPDATE OR DELETE ON public.route_stops
  FOR EACH ROW EXECUTE FUNCTION public.route_child_changed();

DROP TRIGGER IF EXISTS trigger_route_photos_changed ON public.route_photos;
CREATE TRIGGER trigger_route_photos_changed
  AFTER INSERT OR UPDATE ON public.route_photos
  FOR EACH ROW EXECUTE FUNCTION public.route_child_changed();

-- ----------------------------------------------------------- routes (RLS)
DROP POLICY IF EXISTS "Anyone can view appropriate routes" ON public.routes;
CREATE POLICY "Anyone can view appropriate routes"
  ON public.routes FOR SELECT
  USING (published = TRUE OR user_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "Users can update own routes or admins can update any" ON public.routes;
CREATE POLICY "Authors and staff can update routes"
  ON public.routes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_staff())
  WITH CHECK (auth.uid() = user_id OR public.is_staff());

DROP POLICY IF EXISTS "Users can delete own routes or admins can delete any" ON public.routes;
CREATE POLICY "Admins can delete routes"
  ON public.routes FOR DELETE TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------ route_stops
DROP POLICY IF EXISTS "Route stops are viewable by everyone" ON public.route_stops;
CREATE POLICY "Route stops are viewable by everyone"
  ON public.route_stops FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.routes r
    WHERE r.id = route_stops.route_id
      AND (r.published = TRUE OR r.user_id = auth.uid() OR public.is_staff())
  ));

DROP POLICY IF EXISTS "Route owners can manage stops" ON public.route_stops;
CREATE POLICY "Route authors and staff can manage stops"
  ON public.route_stops FOR ALL TO authenticated
  USING (public.is_staff() OR EXISTS (
    SELECT 1 FROM public.routes r
    WHERE r.id = route_stops.route_id AND r.user_id = auth.uid()
  ))
  WITH CHECK (public.is_staff() OR EXISTS (
    SELECT 1 FROM public.routes r
    WHERE r.id = route_stops.route_id AND r.user_id = auth.uid()
  ));

-- ----------------------------------------------------------- route_photos
DROP POLICY IF EXISTS "Route photos are viewable by everyone" ON public.route_photos;
CREATE POLICY "Route photos are viewable by everyone"
  ON public.route_photos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.routes r
    WHERE r.id = route_photos.route_id
      AND (r.published = TRUE OR r.user_id = auth.uid() OR public.is_staff())
  ));

DROP POLICY IF EXISTS "Route authors and admins can add photos" ON public.route_photos;
CREATE POLICY "Route authors and staff can add photos"
  ON public.route_photos FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND (public.is_staff() OR EXISTS (
      SELECT 1 FROM public.routes r
      WHERE r.id = route_photos.route_id AND r.user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Uploaders and admins can delete photos" ON public.route_photos;
CREATE POLICY "Uploaders, route authors and staff can delete photos"
  ON public.route_photos FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id OR public.is_staff() OR EXISTS (
      SELECT 1 FROM public.routes r
      WHERE r.id = route_photos.route_id AND r.user_id = auth.uid()
    )
  );

-- --------------------------------------------------------- route_comments
DROP POLICY IF EXISTS "Anyone can read comments on published routes" ON public.route_comments;
CREATE POLICY "Anyone can read comments on published routes"
  ON public.route_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.routes r
    WHERE r.id = route_comments.route_id
      AND (r.published = TRUE OR r.user_id = auth.uid() OR public.is_staff())
  ));

DROP POLICY IF EXISTS "Admins can delete any comment" ON public.route_comments;
CREATE POLICY "Staff and route authors can delete comments"
  ON public.route_comments FOR DELETE TO authenticated
  USING (
    public.is_staff() OR EXISTS (
      SELECT 1 FROM public.routes r
      WHERE r.id = route_comments.route_id AND r.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------- storage: route_map
DROP POLICY IF EXISTS "Route authors and admins can upload thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Route authors and admins can update thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Route authors and admins can delete thumbnails" ON storage.objects;

CREATE POLICY "Route authors and staff can upload thumbnails"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'route_map' AND (
      public.is_staff() OR EXISTS (
        SELECT 1 FROM public.routes r
        WHERE storage.objects.name = 'thumbnail-' || r.id || '.png'
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
        WHERE storage.objects.name = 'thumbnail-' || r.id || '.png'
          AND r.user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    bucket_id = 'route_map' AND (
      public.is_staff() OR EXISTS (
        SELECT 1 FROM public.routes r
        WHERE storage.objects.name = 'thumbnail-' || r.id || '.png'
          AND r.user_id = auth.uid()
      )
    )
  );

-- Deleting thumbnails only happens when a route is deleted (admins)
CREATE POLICY "Admins can delete thumbnails"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'route_map' AND public.is_admin());

-- ---------------------------------------------------- storage: route_photos
DROP POLICY IF EXISTS "Route authors and admins can upload route photos" ON storage.objects;
DROP POLICY IF EXISTS "Uploaders and admins can delete route photos" ON storage.objects;

CREATE POLICY "Route authors and staff can upload route photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'route_photos' AND (
      public.is_staff() OR EXISTS (
        SELECT 1 FROM public.routes r
        WHERE r.id::text = (storage.foldername(storage.objects.name))[1]
          AND r.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Uploaders, route authors and staff can delete route photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'route_photos' AND (
      owner_id = auth.uid()::text OR public.is_staff() OR EXISTS (
        SELECT 1 FROM public.routes r
        WHERE r.id::text = (storage.foldername(storage.objects.name))[1]
          AND r.user_id = auth.uid()
      )
    )
  );
