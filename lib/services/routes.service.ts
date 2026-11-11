import { supabase } from "@/lib/supabase/client";
import { isUuid } from "@/lib/route-url";
import {
  RouteWithDetails,
  RouteFilters,
  RouteSort,
  RouteInsert,
  RouteUpdate,
  Route,
  RouteStop,
} from "@/types";

export class RoutesService {
  /**
   * Fetch routes with optional filters and sorting
   */
  static async getRoutes(filters?: RouteFilters, sort?: RouteSort) {
    let query = supabase
      .from("routes")
      .select(
        `
        *,
        stops:route_stops(*),
        photos:route_photos(*),
        ratings:route_ratings(*)
      `,
      )
      .eq("published", true);

    // Apply filters
    if (filters?.category?.length) {
      query = query.in("category", filters.category);
    }

    if (filters?.difficulty?.length) {
      query = query.in("difficulty", filters.difficulty);
    }

    if (filters?.min_distance) {
      query = query.gte("distance_km", filters.min_distance);
    }

    if (filters?.max_distance) {
      query = query.lte("distance_km", filters.max_distance);
    }

    if (filters?.min_duration) {
      query = query.gte("duration_minutes", filters.min_duration);
    }

    if (filters?.max_duration) {
      query = query.lte("duration_minutes", filters.max_duration);
    }

    if (filters?.min_scenic_score) {
      query = query.gte("scenic_score", filters.min_scenic_score);
    }

    if (filters?.region?.length) {
      query = query.in("region", filters.region);
    }

    if (filters?.country?.length) {
      query = query.in("country", filters.country);
    }

    if (filters?.route_type?.length) {
      query = query.in("route_type", filters.route_type);
    }

    if (filters?.search) {
      query = query.ilike("title", `%${filters.search}%`);
    }

    // Apply sorting
    if (sort) {
      query = query.order(sort.field, { ascending: sort.direction === "asc" });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as RouteWithDetails[];
  }

  /**
   * Published routes with these slugs (blog route cards)
   */
  static async getRoutesBySlugs(slugs: string[]) {
    const { data, error } = await supabase
      .from("routes")
      .select(
        `
        *,
        stops:route_stops(*),
        photos:route_photos(*),
        ratings:route_ratings(*)
      `,
      )
      .eq("published", true)
      .in("slug", slugs);

    if (error) throw error;
    return data as RouteWithDetails[];
  }

  /**
   * Get a single route by its slug or (legacy URLs) its id
   */
  static async getRouteByIdOrSlug(idOrSlug: string) {
    return isUuid(idOrSlug)
      ? RoutesService.getRouteById(idOrSlug)
      : RoutesService.getRouteBy("slug", idOrSlug);
  }

  /**
   * Get a single route by ID
   */
  static async getRouteById(id: string) {
    return RoutesService.getRouteBy("id", id);
  }

  private static async getRouteBy(column: "id" | "slug", value: string) {
    const { data, error } = await supabase
      .from("routes")
      .select(
        `
        *,
        stops:route_stops(*),
        photos:route_photos(*),
        ratings:route_ratings(*)
      `,
      )
      .eq(column, value)
      .single();

    if (error) throw error;
    return data as RouteWithDetails;
  }

  /**
   * Real totals for the home page (published routes only)
   */
  static async getStats() {
    const { data, error } = await supabase
      .from("routes")
      .select("distance_km, region")
      .eq("published", true);

    if (error) throw error;
    const rows = (data ?? []) as { distance_km: number | null; region: string | null }[];
    return {
      routes: rows.length,
      km: Math.round(rows.reduce((sum, r) => sum + (r.distance_km ?? 0), 0)),
      regions: new Set(rows.map((r) => r.region).filter(Boolean)).size,
    };
  }

  /**
   * Route authors ranked by number of published routes
   */
  static async getTopContributors(limit = 6) {
    const { data, error } = await supabase
      .from("routes")
      .select("user_id, distance_km")
      .eq("published", true);

    if (error) throw error;
    const byUser = new Map<string, { routes: number; km: number }>();
    for (const r of (data ?? []) as { user_id: string; distance_km: number | null }[]) {
      const cur = byUser.get(r.user_id) ?? { routes: 0, km: 0 };
      cur.routes += 1;
      cur.km += r.distance_km ?? 0;
      byUser.set(r.user_id, cur);
    }

    const ids = [...byUser.keys()];
    if (ids.length === 0) return [];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, created_at")
      .in("id", ids);

    return ((profiles ?? []) as { id: string; full_name: string | null; avatar_url: string | null; created_at: string }[])
      .map((p) => ({ ...p, ...byUser.get(p.id)!, km: Math.round(byUser.get(p.id)!.km) }))
      .sort((a, b) => b.routes - a.routes)
      .slice(0, limit);
  }

  /**
   * Most recently published routes (home page)
   */
  static async getLatestRoutes(limit = 6) {
    const { data, error } = await supabase
      .from("routes")
      .select(
        `
        *,
        stops:route_stops(*),
        photos:route_photos(*)
      `,
      )
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as RouteWithDetails[];
  }

  /**
   * Get featured routes
   */
  static async getFeaturedRoutes(limit = 3) {
    const { data, error } = await supabase
      .from("routes")
      .select(
        `
        *,
        stops:route_stops(*),
        photos:route_photos(*)
      `,
      )
      .eq("featured", true)
      .eq("published", true)
      .order("scenic_score", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as RouteWithDetails[];
  }

  /**
   * Save a route for a user (no-op if it is already saved)
   */
  static async saveRoute(routeId: string, userId: string) {
    const { error } = await supabase
      .from("saved_routes")
      .upsert({ route_id: routeId, user_id: userId } as any, {
        onConflict: "user_id,route_id",
        ignoreDuplicates: true,
      });

    if (error) throw error;
  }

  /**
   * Unsave a route for a user
   */
  static async unsaveRoute(routeId: string, userId: string) {
    const { error } = await supabase
      .from("saved_routes")
      .delete()
      .eq("route_id", routeId)
      .eq("user_id", userId);

    if (error) throw error;
  }

  /**
   * Rate a route
   */
  static async rateRoute(
    routeId: string,
    userId: string,
    ratings: {
      scenic_rating: number;
      road_quality_rating: number;
      fun_factor_rating: number;
      comment?: string;
    },
  ) {
    const { data, error } = await supabase
      .from("route_ratings")
      .upsert({
        route_id: routeId,
        user_id: userId,
        ...ratings,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * IDs of the routes a user has saved
   */
  static async getSavedRouteIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from("saved_routes")
      .select("route_id")
      .eq("user_id", userId);

    if (error) throw error;
    return ((data as { route_id: string }[]) ?? []).map((r) => r.route_id);
  }

  /**
   * Get user's saved routes, most recently saved first
   */
  static async getSavedRoutes(userId: string): Promise<RouteWithDetails[]> {
    const { data, error } = await supabase
      .from("saved_routes")
      .select(
        `
        created_at,
        route:routes(
          *,
          stops:route_stops(*),
          photos:route_photos(*),
          ratings:route_ratings(*)
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    // A route can be hidden by RLS (e.g. unpublished) — skip those
    return ((data as any[]) ?? [])
      .map((row) => row.route as RouteWithDetails | null)
      .filter((r): r is RouteWithDetails => r !== null);
  }

  /**
   * Routes created by a user, any status (RLS shows authors their own routes)
   */
  static async getUserRoutes(userId: string): Promise<RouteWithDetails[]> {
    const { data, error } = await supabase
      .from("routes")
      .select(
        `
        *,
        stops:route_stops(*),
        photos:route_photos(*),
        ratings:route_ratings(*)
      `,
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return (data as RouteWithDetails[]) ?? [];
  }

  /**
   * Replace the stops of a route with the given list (in order)
   */
  static async saveStops(
    routeId: string,
    stops: Array<Pick<RouteStop, "name" | "description" | "type" | "latitude" | "longitude"> & { id?: string }>,
  ): Promise<RouteStop[]> {
    const keepIds = stops.map((s) => s.id).filter((id): id is string => !!id);

    let del = supabase.from("route_stops").delete().eq("route_id", routeId);
    if (keepIds.length) del = del.not("id", "in", `(${keepIds.join(",")})`);
    const { error: delError } = await del;
    if (delError) throw delError;

    if (stops.length === 0) return [];

    const row = (s: (typeof stops)[number], i: number) => ({
      route_id: routeId,
      name: s.name,
      description: s.description || null,
      type: s.type,
      latitude: s.latitude,
      longitude: s.longitude,
      order_index: i,
    });

    const saved: RouteStop[] = [];
    for (const [i, s] of stops.entries()) {
      const query = s.id
        ? supabase.from("route_stops").update(row(s, i) as never).eq("id", s.id)
        : supabase.from("route_stops").insert(row(s, i) as never);
      const { data, error } = await query.select().single();
      if (error) throw error;
      saved.push(data as RouteStop);
    }
    return saved;
  }

  static async createRoute(routeData: RouteInsert) {
    const { data, error } = await supabase
      .from("routes")
      .insert({
        ...routeData,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateRoute(id: string, routeData: any): Promise<Route> {
    // @ts-expect-error
    const { data, error } = await supabase.from("routes").update(routeData).eq("id", id).select().single();

    if (error) throw error;
    return data as Route;
  }
}
