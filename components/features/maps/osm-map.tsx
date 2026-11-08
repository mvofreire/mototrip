"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";

export type LatLng = { lat: number; lng: number };

export interface OsmMarker {
  id: string;
  position: LatLng;
  title?: string;
  /** Inline HTML rendered inside a circular pin */
  html: string;
  color?: string;
  size?: number;
  onClick?: () => void;
}

export interface OsmMapProps {
  center: LatLng;
  zoom: number;
  polyline?: LatLng[];
  polylineColor?: string;
  markers?: OsmMarker[];
  /** Zoom to fit the polyline (or markers when there is no polyline) */
  fitBounds?: boolean;
  scrollWheelZoom?: boolean;
  className?: string;
}

function pinIcon({ html, color = "#f59e0b", size = 28 }: OsmMarker) {
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid rgba(0,0,0,.15);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,.35);cursor:pointer">${html}</div>`,
  });
}

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();
  // Only refit when the coordinates actually change, not on every re-render
  // (otherwise clicking a marker would reset the user's pan/zoom).
  const key = points.map((p) => `${p.lat},${p.lng}`).join("|");

  useEffect(() => {
    if (points.length === 0) return;
    const fit = () => {
      // The container may have been laid out after Leaflet initialised
      map.invalidateSize();
      if (points.length === 1) {
        map.setView(points[0], 12);
      } else {
        map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), {
          padding: [40, 40],
        });
      }
    };
    fit();
    const id = window.setTimeout(fit, 100);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

/** OpenStreetMap map used when Google Maps is unavailable. */
export default function OsmMap({
  center,
  zoom,
  polyline = [],
  polylineColor = "#3b82f6",
  markers = [],
  fitBounds = true,
  scrollWheelZoom = false,
  className = "w-full h-full",
}: OsmMapProps) {
  const boundsPoints = useMemo(
    () => (polyline.length > 0 ? polyline : markers.map((m) => m.position)),
    [polyline, markers],
  );

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={scrollWheelZoom}
      className={className}
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {polyline.length > 1 && (
        <Polyline
          positions={polyline}
          pathOptions={{ color: polylineColor, weight: 4, opacity: 0.85 }}
        />
      )}
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={m.position}
          icon={pinIcon(m)}
          eventHandlers={m.onClick ? { click: m.onClick } : undefined}
        >
          {m.title && <Tooltip direction="top">{m.title}</Tooltip>}
        </Marker>
      ))}
      {fitBounds && <FitBounds points={boundsPoints} />}
    </MapContainer>
  );
}
