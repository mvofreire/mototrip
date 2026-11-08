"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { RouteWithDetails } from "@/types";

const RouteCoverMap = dynamic(() => import("./route-cover-map"), { ssr: false });

/**
 * Background of the route page hero: the first route photo when there is
 * one, otherwise a stylised map of the route itself.
 */
export function RouteCover({ route }: { route: RouteWithDetails }) {
  const photo = useMemo(
    () => [...(route.photos ?? [])].sort((a, b) => a.order_index - b.order_index)[0],
    [route.photos],
  );

  const points = useMemo(() => {
    const coords = (route.polyline_coordinates as { coordinates?: [number, number][] } | null)
      ?.coordinates;
    return coords?.map(([lng, lat]) => ({ lat, lng })) ?? [];
  }, [route.polyline_coordinates]);

  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo.url}
        alt={photo.caption ?? route.title}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  if (points.length > 1) {
    return (
      <div className="absolute inset-0">
        <RouteCoverMap points={points} />
      </div>
    );
  }

  return null;
}
