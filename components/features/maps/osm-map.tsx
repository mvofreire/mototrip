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
  useMapEvents,
} from "react-leaflet";

export type LatLng = { lat: number; lng: number };

export interface OsmMarker {
  id: string;
  position: LatLng;
  title?: string;
  /** Inline HTML rendered inside the pin head (ignored for the "logo" variant) */
  html?: string;
  /** Flat color instead of the brand gradient (e.g. a highlighted marker) */
  color?: string;
  /** Pin width in px */
  size?: number;
  /** "pin": teardrop pin; "logo": the app icon (favicon) on a pointer */
  variant?: "pin" | "logo";
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
  /** Called with the clicked position */
  onMapClick?: (position: LatLng) => void;
}

// Same red gradient as the favicon (app/icon.svg)
const BRAND_GRADIENT = `<linearGradient id="mt-brand" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ef233c"/><stop offset=".55" stop-color="#d00f25"/><stop offset="1" stop-color="#8d0a1a"/></linearGradient>`;
const SHADOW = "filter:drop-shadow(0 2px 3px rgba(0,0,0,.4));cursor:pointer";

function pinIcon({ html = "", color, size = 28, variant = "pin" }: OsmMarker) {
  const fill = color ?? "url(#mt-brand)";

  if (variant === "logo") {
    // The favicon tile (rounded square + white map pin) with a small pointer
    const w = size;
    const h = Math.round(size * 1.2);
    return L.divIcon({
      className: "",
      iconSize: [w, h],
      iconAnchor: [w / 2, h],
      tooltipAnchor: [0, -h],
      html: `<svg width="${w}" height="${h}" viewBox="0 0 64 77" style="${SHADOW};overflow:visible"><defs>${BRAND_GRADIENT}</defs><path d="M24 62h16l-8 13z" fill="#8d0a1a"/><rect x="1" y="1" width="62" height="62" rx="14" fill="${fill}" stroke="#fff" stroke-width="3"/><g transform="translate(12 11) scale(1.6667)" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></g></svg>`,
    });
  }

  // Teardrop pin in the brand gradient, white outline, content in the head
  const w = size;
  const h = Math.round(size * 1.3);
  const font = Math.max(10, Math.round(size * 0.42));
  return L.divIcon({
    className: "",
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    tooltipAnchor: [0, -h],
    html: `<div style="position:relative;width:${w}px;height:${h}px;${SHADOW}"><svg width="${w}" height="${h}" viewBox="0 0 32 42" style="position:absolute;inset:0;overflow:visible"><defs>${BRAND_GRADIENT}</defs><path d="M16 1.5C8 1.5 1.5 7.9 1.5 15.8c0 10.4 12.6 22.4 13.4 23.2a1.6 1.6 0 0 0 2.2 0c.8-.8 13.4-12.8 13.4-23.2C30.5 7.9 24 1.5 16 1.5z" fill="${fill}" stroke="#fff" stroke-width="2.5"/></svg><div style="position:absolute;left:0;right:0;top:0;height:${Math.round(w * 1.02)}px;display:flex;align-items:center;justify-content:center;color:#fff;font:700 ${font}px/1 system-ui,sans-serif">${html}</div></div>`,
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

function ClickHandler({ onClick }: { onClick: (p: LatLng) => void }) {
  useMapEvents({
    click: (e) => onClick({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

/** Interactive OpenStreetMap map (Leaflet). */
export default function OsmMap({
  center,
  zoom,
  polyline = [],
  polylineColor = "#e11d2e",
  markers = [],
  fitBounds = true,
  scrollWheelZoom = false,
  className = "w-full h-full",
  onMapClick,
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
      {onMapClick && <ClickHandler onClick={onMapClick} />}
    </MapContainer>
  );
}
