"use client";

import dynamic from "next/dynamic";

export type { LatLng, OsmMarker, OsmMapProps } from "./osm-map";

/**
 * OpenStreetMap (Leaflet) map. Leaflet touches `window`, so it is only
 * loaded on the client.
 */
export const Map = dynamic(() => import("./osm-map"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted animate-pulse" />,
});
