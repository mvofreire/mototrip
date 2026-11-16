"use client";

import { useQuery } from "@tanstack/react-query";
import { RoutesService } from "@/lib/services/routes.service";
import { RatingsService } from "@/lib/services/ratings.service";
import { useAuth } from "@/hooks/use-auth";
import { useSavedRouteIds } from "@/hooks/use-saved-routes";

/** Routes the signed-in user submitted, any status, most recently updated first */
export function useMyRoutes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-routes", user?.id],
    queryFn: () => RoutesService.getUserRoutes(user!.id),
    enabled: !!user,
    // Submit, edit and delete live on other pages and don't touch this cache:
    // show what we have and refresh on every visit to the profile
    refetchOnMount: "always",
  });
}

/** How many routes the signed-in user rated ("I rode this route") */
export function useMyReviewCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-review-count", user?.id],
    queryFn: () => RatingsService.countByUser(user!.id),
    enabled: !!user,
    refetchOnMount: "always",
  });
}

/**
 * Profile numbers. Created and saved reuse the queries the profile lists (and
 * every save button) already run, so they follow saves/unsaves at once with no
 * extra request; reviews is a head-only count.
 */
export function useProfileStats() {
  const mine = useMyRoutes();
  const saved = useSavedRouteIds();
  const reviews = useMyReviewCount();
  return {
    created: mine.data?.length,
    saved: saved.data?.size,
    reviews: reviews.data,
  };
}
