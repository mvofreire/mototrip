"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import type { RouteWithDetails } from "@/types";

const RouteCoverMap = dynamic(() => import("./route-cover-map"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-muted animate-pulse" />,
});

/**
 * Route card thumbnail: an OpenStreetMap (Leaflet) render of the route,
 * styled like the cover of the route page. The map is only mounted once the
 * card is close to the viewport, so long lists don't load every map at once.
 */
export function RouteThumbnail({ route }: { route: RouteWithDetails }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const points = useMemo(() => {
    const coords = (route.polyline_coordinates as { coordinates?: [number, number][] } | null)
      ?.coordinates;
    return coords?.map(([lng, lat]) => ({ lat, lng })) ?? [];
  }, [route.polyline_coordinates]);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  if (points.length < 2) {
    return (
      <>
        <div className="absolute inset-0 bg-gradient-to-br from-steel-200 to-steel-400 dark:from-steel-800 dark:to-steel-950" />
        <div className="absolute inset-0 flex items-center justify-center">
          <MapPin className="h-12 w-12 text-steel-500" />
        </div>
      </>
    );
  }

  return (
    // Non-interactive: clicks go through to the card link
    <div ref={ref} className="absolute inset-0 pointer-events-none" aria-hidden>
      {visible ? (
        <RouteCoverMap points={points} variant="thumbnail" />
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}
    </div>
  );
}
