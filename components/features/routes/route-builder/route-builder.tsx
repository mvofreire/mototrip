"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type L from "leaflet";
import { useTranslations } from "next-intl";
import {
  ArrowLeftRight,
  Check,
  Loader2,
  LocateFixed,
  Magnet,
  MapPinned,
  Maximize2,
  Pencil,
  Redo2,
  Repeat,
  Route,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { MAX_ANCHORS, type RouteBuilderState } from "@/hooks/use-route-builder";
import type { GPXStopType } from "@/lib/gpx-parser";
import type { LatLng } from "@/lib/routing/route-builder";

const RouteBuilderMap = dynamic(() => import("./route-builder-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
});

const STOP_TYPES: GPXStopType[] = [
  "viewpoint",
  "cafe",
  "gas_station",
  "restaurant",
  "landmark",
  "accommodation",
];

type Mode = "route" | "stop";

interface StopForm extends LatLng {
  id?: string;
  name: string;
  description: string;
  type: GPXStopType;
}

interface RouteBuilderProps {
  builder: RouteBuilderState;
  /** Recommended stops can be placed (new routes; edits use the stops editor) */
  allowStops?: boolean;
}

function ToolButton({
  label,
  active,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { label: string; active?: boolean }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "h-11 w-11 shrink-0",
        active && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

/**
 * Draw a route on the map: every tap adds a point and the road to it is
 * calculated. A second mode places the recommended stops.
 */
export function RouteBuilder({ builder, allowStops = true }: RouteBuilderProps) {
  const t = useTranslations("submit.builder");
  const tSubmit = useTranslations("submit");
  const tTypes = useTranslations("stopTypes");

  const [mode, setMode] = useState<Mode>("route");
  const [fullscreen, setFullscreen] = useState(false);
  const [touch, setTouch] = useState(false);
  const [selectedAnchor, setSelectedAnchor] = useState<number | null>(null);
  const [stopForm, setStopForm] = useState<StopForm | null>(null);
  const [locateFailed, setLocateFailed] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  const { anchors, segments, stops, draft, busy } = builder;

  // On touch screens the inline map would trap the page scroll: it is only a
  // preview there, and editing happens in full screen.
  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const update = () => setTouch(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  // The container changed size: Leaflet has to measure it again, and the
  // route is brought back into view
  useEffect(() => {
    const id = window.setTimeout(() => {
      const map = mapRef.current;
      if (!map) return;
      map.invalidateSize();
      const points = builder.draft.points;
      if (points.length > 1) {
        map.fitBounds(
          points.map((p) => [p.lat, p.lng] as [number, number]),
          { paddingTopLeft: [40, 110], paddingBottomRight: [40, 150] },
        );
      }
    }, 60);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullscreen]);

  // A removed point can leave the selection out of range
  useEffect(() => {
    if (selectedAnchor !== null && selectedAnchor >= anchors.length) setSelectedAnchor(null);
  }, [anchors.length, selectedAnchor]);

  const openStopForm = useCallback((position: LatLng) => {
    setSelectedAnchor(null);
    setStopForm({ ...position, name: "", description: "", type: "viewpoint" });
  }, []);

  const handleMapClick = (position: LatLng) => {
    if (stopForm) return;
    if (selectedAnchor !== null) {
      setSelectedAnchor(null);
      return;
    }
    if (mode === "stop") openStopForm(position);
    else builder.addPoint(position);
  };

  const handleSegmentClick = (index: number, position: LatLng) => {
    if (stopForm) return;
    if (mode === "stop") openStopForm(position);
    else {
      setSelectedAnchor(null);
      builder.insertAnchor(index, position);
    }
  };

  const handleStopClick = (id: string) => {
    const stop = stops.find((s) => s.id === id);
    if (!stop) return;
    setSelectedAnchor(null);
    setStopForm({ ...stop });
  };

  const saveStop = () => {
    if (!stopForm || !stopForm.name.trim()) return;
    builder.saveStop({
      ...stopForm,
      name: stopForm.name.trim().slice(0, 120),
      description: stopForm.description.trim(),
    });
    setStopForm(null);
  };

  const locate = () => {
    const map = mapRef.current;
    if (!map) return;
    setLocateFailed(false);
    map.once("locationerror", () => setLocateFailed(true));
    map.locate({ setView: true, maxZoom: 13 });
  };

  const submitOnEnter = (e: React.KeyboardEvent) => {
    // The builder lives inside the route form: Enter must not submit it
    if (e.key === "Enter") {
      e.preventDefault();
      saveStop();
    }
  };

  const hint = busy
    ? t("calculating")
    : mode === "stop"
      ? t("hintStop")
      : anchors.length === 0
        ? t("hintStart")
        : anchors.length === 1
          ? t("hintNext")
          : t("hintEdit");

  const notice = builder.notice
    ? t(`notice.${builder.notice}`, { max: MAX_ANCHORS })
    : locateFailed
      ? t("notice.locate_failed")
      : null;

  const anchorLabel =
    selectedAnchor === null
      ? ""
      : selectedAnchor === 0
        ? t("start")
        : selectedAnchor === anchors.length - 1
          ? t("end")
          : t("point", { n: selectedAnchor + 1 });

  const preview = touch && !fullscreen;
  const totalMinutes = Math.round(draft.durationMin);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        fullscreen
          ? // !m-0: a parent's space-y-* margin would push the fixed layer down
            "fixed inset-0 z-[60] !m-0 h-[100dvh]"
          : "h-[60vh] max-h-[640px] min-h-[380px] rounded-lg border",
      )}
    >
      <RouteBuilderMap
        anchors={anchors}
        segments={segments}
        stops={stops}
        pending={builder.pending}
        busy={busy}
        selectedAnchor={selectedAnchor}
        selectedStop={stopForm?.id ?? null}
        onMapClick={handleMapClick}
        onAnchorClick={(i) => {
          if (!stopForm) setSelectedAnchor(i);
        }}
        onAnchorMove={(i, position) => {
          setSelectedAnchor(null);
          builder.moveAnchor(i, position);
        }}
        onSegmentClick={handleSegmentClick}
        onStopClick={handleStopClick}
        onReady={(map) => {
          mapRef.current = map;
        }}
      />

      {/* Touch screens: the inline map only opens the full-screen editor */}
      {preview && (
        <div className="absolute inset-0 z-[600] flex items-center justify-center bg-background/40 p-4">
          <Button type="button" size="lg" className="shadow-lg" onClick={() => setFullscreen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            {anchors.length > 0 || stops.length > 0 ? t("continue") : t("open")}
          </Button>
        </div>
      )}

      {/* Top: stats, hint and map actions */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] space-y-2 p-2 pl-14 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="flex items-start justify-between gap-2">
          <div className="pointer-events-auto flex flex-wrap items-center gap-x-3 gap-y-0.5 rounded-lg border bg-background/95 px-3 py-2 text-sm font-medium shadow-md backdrop-blur">
            <span>{draft.distanceKm.toFixed(1)} km</span>
            <span className="text-muted-foreground">
              {tSubmit("durationFormat", { hours, minutes })}
            </span>
            {draft.elevationGainM !== null && (
              <span className="text-muted-foreground">↑ {Math.round(draft.elevationGainM)} m</span>
            )}
            {stops.length > 0 && (
              <span className="text-muted-foreground">{t("stopsCount", { count: stops.length })}</span>
            )}
          </div>
          {!preview && (
            <div className="pointer-events-auto flex gap-1 rounded-lg border bg-background/95 p-1 shadow-md backdrop-blur">
              <ToolButton label={t("locate")} onClick={locate}>
                <LocateFixed className="h-5 w-5" />
              </ToolButton>
              {fullscreen ? (
                <Button type="button" className="h-11" onClick={() => setFullscreen(false)}>
                  <Check className="mr-1.5 h-4 w-4" />
                  {t("done")}
                </Button>
              ) : (
                <ToolButton label={t("fullscreen")} onClick={() => setFullscreen(true)}>
                  <Maximize2 className="h-5 w-5" />
                </ToolButton>
              )}
            </div>
          )}
        </div>

        {!preview && (
          <div className="flex flex-col items-start gap-2">
            <div
              role="status"
              className="inline-flex items-center gap-2 rounded-full bg-foreground/90 px-3 py-1.5 text-xs font-medium text-background shadow"
            >
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {hint}
            </div>
            {notice && (
              <div
                role="alert"
                className="pointer-events-auto flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 shadow dark:bg-amber-950 dark:text-amber-300"
              >
                <span>{notice}</span>
                <button
                  type="button"
                  aria-label={t("dismiss")}
                  className="-m-1 shrink-0 rounded p-1 hover:bg-amber-100 dark:hover:bg-amber-900"
                  onClick={() => {
                    builder.dismissNotice();
                    setLocateFailed(false);
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom: stop form, selected point or the toolbar */}
      {!preview && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[500] flex justify-center p-2 pb-[max(1.75rem,env(safe-area-inset-bottom))]">
          {stopForm ? (
            <div className="pointer-events-auto w-full max-w-md space-y-3 rounded-xl border bg-background p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{stopForm.id ? t("editStop") : t("newStop")}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="-mr-2 h-9 w-9"
                  aria-label={t("cancel")}
                  onClick={() => setStopForm(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="builder-stop-name">{t("stopName")}</Label>
                <Input
                  id="builder-stop-name"
                  autoFocus
                  maxLength={120}
                  placeholder={t("stopNamePlaceholder")}
                  value={stopForm.name}
                  onChange={(e) => setStopForm({ ...stopForm, name: e.target.value })}
                  onKeyDown={submitOnEnter}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="builder-stop-type">{t("stopType")}</Label>
                <select
                  id="builder-stop-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={stopForm.type}
                  onChange={(e) => setStopForm({ ...stopForm, type: e.target.value as GPXStopType })}
                >
                  {STOP_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {tTypes(type)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="builder-stop-notes">{t("stopNotes")}</Label>
                <Input
                  id="builder-stop-notes"
                  placeholder={t("stopNotesPlaceholder")}
                  value={stopForm.description}
                  onChange={(e) => setStopForm({ ...stopForm, description: e.target.value })}
                  onKeyDown={submitOnEnter}
                />
              </div>
              <div className="flex gap-2">
                {stopForm.id && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 text-destructive hover:text-destructive"
                    onClick={() => {
                      builder.removeStop(stopForm.id!);
                      setStopForm(null);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("remove")}
                  </Button>
                )}
                <Button
                  type="button"
                  className="h-11 flex-1"
                  disabled={!stopForm.name.trim()}
                  onClick={saveStop}
                >
                  <Check className="mr-2 h-4 w-4" />
                  {t("saveStop")}
                </Button>
              </div>
            </div>
          ) : selectedAnchor !== null ? (
            <div className="pointer-events-auto flex items-center gap-2 rounded-xl border bg-background p-2 pl-4 shadow-lg">
              <span className="text-sm font-medium">{anchorLabel}</span>
              <Button
                type="button"
                variant="outline"
                className="h-11 text-destructive hover:text-destructive"
                disabled={busy}
                onClick={() => {
                  builder.removeAnchor(selectedAnchor);
                  setSelectedAnchor(null);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("removePoint")}
              </Button>
              <ToolButton label={t("cancel")} onClick={() => setSelectedAnchor(null)}>
                <X className="h-5 w-5" />
              </ToolButton>
            </div>
          ) : (
            <div
              role="toolbar"
              aria-label={t("toolbar")}
              className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-1 rounded-xl border bg-background/95 p-1 shadow-lg backdrop-blur"
            >
              {allowStops && (
                <div className="flex gap-1 rounded-lg bg-muted p-1">
                  {(["route", "stop"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={mode === m}
                      onClick={() => setMode(m)}
                      className={cn(
                        "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        mode === m
                          ? "bg-primary text-primary-foreground shadow"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {m === "route" ? <Route className="h-4 w-4" /> : <MapPinned className="h-4 w-4" />}
                      {m === "route" ? t("modeRoute") : t("modeStop")}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-0.5">
                <ToolButton
                  label={builder.followRoads ? t("followRoadsOn") : t("followRoadsOff")}
                  active={builder.followRoads}
                  onClick={() => builder.setFollowRoads(!builder.followRoads)}
                >
                  <Magnet className="h-5 w-5" />
                </ToolButton>
                <ToolButton label={t("undo")} disabled={!builder.canUndo || busy} onClick={builder.undo}>
                  <Undo2 className="h-5 w-5" />
                </ToolButton>
                <ToolButton label={t("redo")} disabled={!builder.canRedo || busy} onClick={builder.redo}>
                  <Redo2 className="h-5 w-5" />
                </ToolButton>
                <ToolButton
                  label={t("closeLoop")}
                  disabled={anchors.length < 2 || draft.isLoop || busy}
                  onClick={() => builder.closeLoop()}
                >
                  <Repeat className="h-5 w-5" />
                </ToolButton>
                <ToolButton label={t("reverse")} disabled={anchors.length < 2 || busy} onClick={builder.reverse}>
                  <ArrowLeftRight className="h-5 w-5" />
                </ToolButton>
                <ToolButton
                  label={t("clear")}
                  disabled={(anchors.length === 0 && stops.length === 0) || busy}
                  onClick={() => {
                    builder.clear();
                    setSelectedAnchor(null);
                  }}
                >
                  <Trash2 className="h-5 w-5" />
                </ToolButton>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
