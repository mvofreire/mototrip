-- 011: Address Supabase security advisor warnings

-- Pin search_path on trigger/helper functions
ALTER FUNCTION public.handle_updated_at() SET search_path = public;
ALTER FUNCTION public.update_route_comments_updated_at() SET search_path = public;
ALTER FUNCTION public.update_route_scores() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- handle_new_user is a trigger function; it must not be callable via /rpc
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Note: public.is_admin() stays executable by anon/authenticated because
-- RLS policies call it with the caller's privileges.
