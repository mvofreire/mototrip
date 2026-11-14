"use client";

import { RouteWithDetails } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { Download, MapIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { buildGpx, gpxFileName, googleMapsUrl } from "@/lib/route-export";
import { trackEvent } from "@/lib/analytics";
import { Map, type OsmMarker } from "@/components/features/maps/map";


type Coordinate = {
  lat: number;
  lng: number;
};
type Coordinates = Array<Coordinate>;

interface RouteMapProps {
  route: RouteWithDetails;
}

export function RouteMap({ route }: RouteMapProps) {
  const t = useTranslations("route");

  // Extract coordinates from polyline
  const coordinates = useMemo(() => {
    if (route.polyline_coordinates?.coordinates) {
      return route.polyline_coordinates.coordinates.map(
        ([lng, lat]: [number, number]) => ({ lat, lng }),
      ) as Coordinates;
    }
    return [];
  }, [route.polyline_coordinates]);

  // Calculate center point
  const center = useMemo(() => {
    if (coordinates.length === 0) {
      return { lat: 40.4168, lng: -3.7038 }; // Madrid default
    }

    const avgLat =
      coordinates.reduce(
        (sum: number, coord: { lat: number; lng: number }) => sum + coord.lat,
        0,
      ) / coordinates.length;
    const avgLng =
      coordinates.reduce(
        (sum: number, coord: { lat: number; lng: number }) => sum + coord.lng,
        0,
      ) / coordinates.length;

    return { lat: avgLat, lng: avgLng };
  }, [coordinates]);

  // Start, end and stop markers
  const osmMarkers = useMemo<OsmMarker[]>(() => {
    const markers: OsmMarker[] = (route.stops ?? []).map((stop, index) => ({
      id: `stop-${stop.id}`,
      position: { lat: Number(stop.latitude), lng: Number(stop.longitude) },
      title: stop.name,
      html: String(index + 1),
      size: 26,
    }));
    if (coordinates.length > 1) {
      markers.push({
        id: "end",
        position: coordinates[coordinates.length - 1],
        title: t("end"),
        // Flag
        html: '<svg width="15" height="15" viewBox="0 0 24 24" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"><path d="M5 22V3"/><path d="M5 4h12l-2.5 4.5L17 13H5z"/></svg>',
        size: 34,
      });
    }
    if (coordinates.length > 0) {
      markers.push({
        id: "start",
        position: coordinates[0],
        title: t("start"),
        // Play
        html: '<svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"/></svg>',
        size: 34,
      });
    }
    return markers;
  }, [route.stops, coordinates, t]);

  const trackData = { route: route.slug || route.id };

  // Generate and download the GPX of the route
  const handleDownloadGPX = () => {
    if (coordinates.length === 0) {
      alert(t("noCoordinates"));
      return;
    }

    try {
      const gpxContent = buildGpx(coordinates, route.title, route.description || "");
      const blob = new Blob([gpxContent], { type: "application/gpx+xml" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = gpxFileName(route.title);
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      trackEvent("gpx_download", { ...trackData, from: "route" });
    } catch (error) {
      console.error("Error generating GPX:", error);
      alert(t("gpxFailed"));
    }
  };

  const handleOpenInGoogleMaps = () => {
    const url = googleMapsUrl(coordinates);
    if (!url) {
      alert(t("noCoordinates"));
      return;
    }
    trackEvent("google_maps_open", { ...trackData, from: "route" });
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="aspect-video relative">
          <Map
            center={center}
            zoom={10}
            polyline={coordinates}
            markers={osmMarkers}
          />
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleDownloadGPX}
          variant="outline"
          className="flex-1 sm:flex-initial"
          disabled={coordinates.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          {t("downloadGPX")}
        </Button>
        <Button
          onClick={handleOpenInGoogleMaps}
          variant="outline"
          className="flex-1 sm:flex-initial"
          disabled={coordinates.length === 0}
        >
          <MapIcon className="h-4 w-4 mr-2" />
          {t("openInGoogleMaps")}
        </Button>
      </div>
    </div>
  );
}
