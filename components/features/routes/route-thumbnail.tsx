"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MapPin } from "lucide-react";
import { darkThumbnailUrl } from "@/lib/routes/thumbnail";

/** Grid cards: full width on phones, half on tablets, a third on desktop */
const GRID_SIZES = "(min-width: 1280px) 400px, (min-width: 640px) 50vw, 100vw";

/**
 * Route card thumbnail: the route's stored map image (OpenStreetMap tiles
 * with the red track, rendered when the route is created or its track
 * changes). A plain <img> instead of a live Leaflet map per card: no map
 * script, no tile requests, and next/image serves it as WebP/AVIF at the
 * card's size.
 *
 * There is a light and a dark file and only one <img>, so each visitor
 * downloads one (hidden <img>s still load). The server can't know the theme
 * and renders the dark file, the site's default; a light-theme visitor gets
 * the light file after hydration, and until then the card stays blank
 * (.route-thumb-pending) rather than showing a dark map. If the dark file is
 * missing, the light one is shown with a CSS dark filter instead.
 */
export function RouteThumbnail({
  route,
  priority = false,
  sizes = GRID_SIZES,
}: {
  route: { title: string; thumbnail_url: string | null };
  priority?: boolean;
  sizes?: string;
}) {
  const [darkFailed, setDarkFailed] = useState(false);
  const { resolvedTheme } = useTheme();
  // The theme is only known in the browser; match the server's render until then
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!route.thumbnail_url) {
    return (
      <>
        <div className="absolute inset-0 bg-gradient-to-br from-steel-200 to-steel-400 dark:from-steel-800 dark:to-steel-950" />
        <div className="absolute inset-0 flex items-center justify-center">
          <MapPin className="h-12 w-12 text-steel-500" />
        </div>
      </>
    );
  }

  const dark = darkFailed ? null : darkThumbnailUrl(route.thumbnail_url);
  const light = mounted && resolvedTheme === "light";
  const src = light || !dark ? route.thumbnail_url : dark;

  return (
    // Same element when the src switches (no `key`): a re-created <img> can
    // ignore loading="lazy" and fetch every card's image at once
    <Image
      src={src}
      alt={route.title}
      fill
      sizes={sizes}
      priority={priority}
      onError={src === dark ? () => setDarkFailed(true) : undefined}
      className={[
        "object-cover",
        // Light file in the dark theme: no dark file for this route
        !light && src !== dark ? "route-thumb-filter" : "",
        mounted ? "" : "route-thumb-pending",
      ].join(" ")}
    />
  );
}
