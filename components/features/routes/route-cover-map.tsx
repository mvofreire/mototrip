"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";

type LatLng = { lat: number; lng: number };

function Fit({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    const fit = () => {
      map.invalidateSize();
      // Keep the route in the upper part, clear of the title block
      const { y } = map.getSize();
      map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), {
        paddingTopLeft: [24, Math.round(y * 0.08)],
        paddingBottomRight: [24, Math.round(y * 0.42)],
      });
    };
    fit();
    const id = window.setTimeout(fit, 150);
    window.addEventListener("resize", fit);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("resize", fit);
    };
  }, [map, points]);
  return null;
}

/**
 * Decorative, non-interactive map of the route used as the cover of the
 * route page when it has no photo. Tiles are restyled per theme in CSS
 * (.route-cover-map) so the red route line stands out.
 */
export default function RouteCoverMap({ points }: { points: LatLng[] }) {
  return (
    <MapContainer
      center={points[0]}
      zoom={9}
      className="route-cover-map h-full w-full"
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
        pathOptions={{ color: "#ef233c", weight: 12, opacity: 0.25, interactive: false }}
      />
      <Polyline
        positions={points}
        pathOptions={{ color: "#ef233c", weight: 4, opacity: 1, interactive: false }}
      />
      <Fit points={points} />
    </MapContainer>
  );
}
