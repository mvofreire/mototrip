import { RoutesService } from "@/lib/services/routes.service";
import { Route, RouteInsert, RouteUpdate } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useRoutes = () => {
  return useQuery<Route[], Error>({
    queryKey: ["routes"],
    queryFn: () => RoutesService.getRoutes(),
  });
};

export const useRoutesCreateMutation = () => {
  return useMutation<Route, Error, RouteInsert>({
    mutationFn: RoutesService.createRoute,
  });
};

export const useRoutesUpdateMutation = () => {
  return useMutation<Route, Error, { id: string; routeData: RouteUpdate }>({
    mutationFn: ({ id, routeData }) => RoutesService.updateRoute(id, routeData),
  });
};
