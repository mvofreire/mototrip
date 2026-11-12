"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { pinIcon } from "@/components/features/maps/osm-map";
import type { Anchor, BuilderStop, LatLng, Segment } from "@/lib/routing/route-builder";

const BRAND = "#e11d2e";
/** Portugal, when there is nothing to show yet */
const DEFAULT_CENTER: LatLng = { lat: 39.5, lng: -8 };
const DEFAULT_ZOOM = 7;

export interface RouteBuilderMapProps {
  anchors: Anchor[];
  segments: Segment[];
  stops: BuilderStop[];
  /** Position waiting for the router */
  pending: LatLng | null;
  /** Routing in progress: handles can't be dragged meanwhile */
  busy: boolean;
  selectedAnchor: number | null;
  selectedStop: string | null;
  onMapClick: (position: LatLng) => void;
  onAnchorClick: (index: number) => void;
  onAnchorMove: (index: number, position: LatLng) => void;
  onSegmentClick: (index: number, position: LatLng) => void;
  onStopClick: (id: string) => void;
  onReady: (map: L.Map) => void;
}

/** Round handle with a 32px touch target; the ends of the route are filled */
function anchorIcon(kind: "end" | "middle", selected: boolean) {
  const size = kind === "end" ? 20 : 16;
  const fill = kind === "end" ? BRAND : "#fff";
  const border = kind === "end" ? "#fff" : BRAND;
  const ring = selected ? `box-shadow:0 0 0 4px rgba(37,99,235,.55),0 1px 4px rgba(0,0,0,.5);` : `box-shadow:0 1px 4px rgba(0,0,0,.5);`;
  return L.divIcon({
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    html: `<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:grab"><div style="width:${size}px;height:${size}px;border-radius:9999px;background:${fill};border:3px solid ${border};${ring}"></div></div>`,
  });
}

function Events({ onClick, onReady }: { onClick: (p: LatLng) => void; onReady: (map: L.Map) => void }) {
  const map = useMap();
  useMapEvents({
    click: (e) => onClick({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  useEffect(() => {
    onReady(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return null;
}

/**
 * Zooms to the route when it appears all at once: on open (edit mode, a
 * restored drawing) or after an undone "clear". Points added one by one
 * leave the view alone.
 */
function FitRoute({ anchors, segments }: { anchors: Anchor[]; segments: Segment[] }) {
  const map = useMap();
  const previous = useRef(0);
  useEffect(() => {
    const appeared = previous.current === 0 && anchors.length > 1;
    previous.current = anchors.length;
    if (!appeared) return;
    const bounds = L.latLngBounds(
      segments.flatMap((s) => s.points).map((p) => [p.lat, p.lng] as [number, number]),
    );
    const fit = () => {
      // The container may have been laid out after Leaflet initialised
      map.invalidateSize();
      map.fitBounds(bounds, { paddingTopLeft: [40, 90], paddingBottomRight: [40, 90] });
    };
    fit();
    const id = window.setTimeout(fit, 100);
    return () => window.clearTimeout(id);
  }, [map, anchors.length, segments]);
  return null;
}

/** Leaflet map of the route builder: tap to add, drag handles, tap the line to insert. */
export default function RouteBuilderMap({
  anchors,
  segments,
  stops,
  pending,
  busy,
  selectedAnchor,
  selectedStop,
  onMapClick,
  onAnchorClick,
  onAnchorMove,
  onSegmentClick,
  onStopClick,
  onReady,
}: RouteBuilderMapProps) {
  // Icons are created once: a new icon object would interrupt a drag
  const icons = useMemo(
    () => ({
      end: anchorIcon("end", false),
      endSelected: anchorIcon("end", true),
      middle: anchorIcon("middle", false),
      middleSelected: anchorIcon("middle", true),
    }),
    [],
  );

  return (
    <MapContainer
      center={anchors[0] ?? DEFAULT_CENTER}
      zoom={anchors.length === 1 ? 12 : DEFAULT_ZOOM}
      scrollWheelZoom
      doubleClickZoom={false}
      className="h-full w-full cursor-crosshair"
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {segments.map((segment, i) => {
        const positions = segment.points.map((p) => [p.lat, p.lng] as [number, number]);
        const key = `${anchors[i]?.id}-${anchors[i + 1]?.id}-${segment.points.length}`;
        return (
          <Polyline
            key={key}
            positions={positions}
            pathOptions={{
              color: BRAND,
              weight: 5,
              opacity: 0.9,
              dashArray: segment.routed ? undefined : "8 10",
            }}
            interactive={false}
          />
        );
      })}
      {/* Wide invisible line: an easy target to insert a point with a finger */}
      {segments.map((segment, i) => (
        <Polyline
          key={`hit-${anchors[i]?.id}-${anchors[i + 1]?.id}-${segment.points.length}`}
          positions={segment.points.map((p) => [p.lat, p.lng] as [number, number])}
          pathOptions={{ color: BRAND, weight: 24, opacity: 0 }}
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e);
              onSegmentClick(i, { lat: e.latlng.lat, lng: e.latlng.lng });
            },
          }}
        />
      ))}

      {pending && (
        <CircleMarker
          center={pending}
          radius={8}
          pathOptions={{ color: BRAND, weight: 2, fillColor: BRAND, fillOpacity: 0.3, dashArray: "3 4" }}
          interactive={false}
        />
      )}

      {stops.map((stop) => (
        <Marker
          key={stop.id}
          position={stop}
          icon={pinIcon({
            id: stop.id,
            position: stop,
            html: "★",
            size: 30,
            color: selectedStop === stop.id ? "#2563eb" : undefined,
          })}
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e);
              onStopClick(stop.id);
            },
          }}
        />
      ))}

      {anchors.map((anchor, i) => {
        const isEnd = i === 0 || i === anchors.length - 1;
        const selected = selectedAnchor === i;
        const icon = isEnd
          ? selected
            ? icons.endSelected
            : icons.end
          : selected
            ? icons.middleSelected
            : icons.middle;
        return (
          <Marker
            key={anchor.id}
            position={anchor}
            icon={icon}
            draggable={!busy}
            zIndexOffset={1000}
            eventHandlers={{
              click: (e) => {
                L.DomEvent.stopPropagation(e);
                onAnchorClick(i);
              },
              dragend: (e) => {
                const { lat, lng } = (e.target as L.Marker).getLatLng();
                onAnchorMove(i, { lat, lng });
              },
            }}
          />
        );
      })}

      <FitRoute anchors={anchors} segments={segments} />
      <Events onClick={onMapClick} onReady={onReady} />
    </MapContainer>
  );
}
