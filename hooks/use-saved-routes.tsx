"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RoutesService } from "@/lib/services/routes.service";
import { useAuth } from "@/hooks/use-auth";

const savedIdsKey = (userId?: string) => ["saved-route-ids", userId] as const;
const savedRoutesKey = (userId?: string) => ["saved-routes", userId] as const;

/** Set of route IDs saved by the current user (empty when logged out). */
export function useSavedRouteIds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: savedIdsKey(user?.id),
    queryFn: async () => new Set(await RoutesService.getSavedRouteIds(user!.id)),
    enabled: !!user,
  });
}

/** Full saved routes for the current user, most recent first. */
export function useSavedRoutes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: savedRoutesKey(user?.id),
    queryFn: () => RoutesService.getSavedRoutes(user!.id),
    enabled: !!user,
  });
}

/** Save / unsave a route with an optimistic update of the saved IDs. */
export function useToggleSavedRoute() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ routeId, save }: { routeId: string; save: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      if (save) await RoutesService.saveRoute(routeId, user.id);
      else await RoutesService.unsaveRoute(routeId, user.id);
    },
    onMutate: async ({ routeId, save }) => {
      const key = savedIdsKey(user?.id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Set<string>>(key);
      const next = new Set(previous);
      if (save) next.add(routeId);
      else next.delete(routeId);
      queryClient.setQueryData(key, next);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(savedIdsKey(user?.id), context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: savedIdsKey(user?.id) });
      queryClient.invalidateQueries({ queryKey: savedRoutesKey(user?.id) });
    },
  });
}
