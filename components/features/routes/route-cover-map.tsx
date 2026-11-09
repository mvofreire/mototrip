"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";

type LatLng = { lat: number; lng: number };

type Variant = "cover" | "thumbnail";

function Fit({ points, variant }: { points: LatLng[]; variant: Variant }) {
  const map = useMap();
  useEffect(() => {
    const fit = () => {
      map.invalidateSize();
      const { y } = map.getSize();
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      if (variant === "cover") {
        // Keep the route in the upper part, clear of the title block
        map.fitBounds(bounds, {
          paddingTopLeft: [24, Math.round(y * 0.08)],
          paddingBottomRight: [24, Math.round(y * 0.42)],
        });
      } else {
        map.fitBounds(bounds, { padding: [16, 16] });
      }
    };
    fit();
    const id = window.setTimeout(fit, 150);
    window.addEventListener("resize", fit);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("resize", fit);
    };
  }, [map, points, variant]);
  return null;
}

/**
 * Decorative, non-interactive map of the route. Used as the cover of the
 * route page when it has no photo, and as the route card thumbnail. Tiles
 * are restyled per theme in CSS (.route-cover-map) so the red route line
 * stands out.
 */
export default function RouteCoverMap({
  points,
  variant = "cover",
}: {
  points: LatLng[];
  variant?: Variant;
}) {
  const thumb = variant === "thumbnail";
  return (
    <MapContainer
      center={points[0]}
      zoom={9}
      className={`route-cover-map h-full w-full${thumb ? " route-thumb-map" : ""}`}
      style={{ zIndex: 0 }}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      boxZoom={false}
      keyboard={false}
      attributionControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Glow under the line */}
      <Polyline
        positions={points}
        pathOptions={{ color: "#ef233c", weight: thumb ? 9 : 12, opacity: 0.25, interactive: false }}
      />
      <Polyline
        positions={points}
        pathOptions={{ color: "#ef233c", weight: thumb ? 3 : 4, opacity: 1, interactive: false }}
      />
      <Fit points={points} variant={variant} />
    </MapContainer>
  );
}
