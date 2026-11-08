"use client";

import dynamic from "next/dynamic";
import { ReactNode, useEffect, useRef, useState } from "react";
import type { OsmMapProps } from "./osm-map";

// Leaflet touches `window`, so it must only load on the client
const OsmMap = dynamic(() => import("./osm-map"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted animate-pulse" />,
});

declare global {
  interface Window {
    gm_authFailure?: () => void;
    __gmFailed?: boolean;
  }
}

const GOOGLE_ERROR_SELECTOR = [
  ".gm-err-container",
  ".gm-err-message",
  'a[href*="g.co/dev/maps-no-account"]',
].join(", ");

const listeners = new Set<() => void>();
let handlerInstalled = false;

/**
 * Google calls window.gm_authFailure for key/billing problems
 * (e.g. BillingNotEnabledMapError, RefererNotAllowedMapError).
 */
function subscribeToGoogleFailure(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  if (!handlerInstalled) {
    handlerInstalled = true;
    const previous = window.gm_authFailure;
    window.gm_authFailure = () => {
      window.__gmFailed = true;
      previous?.();
      listeners.forEach((l) => l());
    };
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

interface MapWithFallbackProps {
  /** The Google Maps tree (APIProvider + Map) */
  children: ReactNode;
  /** Props for the OpenStreetMap fallback */
  fallback: OsmMapProps;
}

/**
 * Renders Google Maps and swaps to an OpenStreetMap map when there is no API
 * key or Google reports an auth/billing error.
 */
export function MapWithFallback({ children, fallback }: MapWithFallbackProps) {
  const hasKey = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  const [failed, setFailed] = useState(
    () => !hasKey || (typeof window !== "undefined" && !!window.__gmFailed),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (failed) return;
    const onFail = () => {
      // Remember for other maps / client navigations in this page session
      window.__gmFailed = true;
      setFailed(true);
    };
    const unsubscribe = subscribeToGoogleFailure(onFail);

    // Some errors (e.g. BillingNotEnabledMapError) don't call gm_authFailure;
    // Google instead injects an error container or a "can't load Google Maps
    // correctly" dialog with a link to g.co/dev/maps-no-account.
    const el = containerRef.current;
    const check = () => {
      if (el?.querySelector(GOOGLE_ERROR_SELECTOR)) onFail();
    };
    const observer = el ? new MutationObserver(check) : null;
    if (el && observer) {
      observer.observe(el, { childList: true, subtree: true });
      check();
    }

    return () => {
      unsubscribe();
      observer?.disconnect();
    };
  }, [failed]);

  if (failed) {
    return <OsmMap {...fallback} />;
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      {children}
    </div>
  );
}
