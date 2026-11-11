"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useTranslations } from "next-intl";
import { COUNTRIES, countryName } from "@/lib/countries";
import { Loader2, MapPin, Save, Trash2 } from "lucide-react";
import type { Database } from "@/types/database.types";
import type { RouteWithDetails } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { isStaff } from "@/lib/auth/roles";
import { GPXUpload } from "./gpx-upload";
import { gpxPointsToGeoJSON, type GPXData, type GPXWaypoint } from "@/lib/gpx-parser";
import { RoutesService } from "@/lib/services/routes.service";
import type { StopType } from "@/types";
import { useRoutesCreateMutation, useRoutesUpdateMutation } from "@/hooks/use-routes";
import { RouteStorage } from "@/lib/storage/storage.service";
import { renderRouteThumbnail } from "@/lib/map-thumbnail";

type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];

interface SubmitRouteFormProps {
  locale: string;
  /** Edit mode: the route being edited */
  route?: RouteWithDetails;
  /** Edit mode: called with the saved route */
  onSaved?: (route: RouteWithDetails) => void;
}

/** Slider upper bound that never cuts off the current value */
const sliderMax = (base: number, value: number, step: number) =>
  Math.max(base, Math.ceil(value / step) * step);

export function SubmitRouteForm({ locale, route, onSaved }: SubmitRouteFormProps) {
  const t = useTranslations("submit");
  const tEdit = useTranslations("editRoute");
  const router = useRouter();
  const { user: authUser } = useAuth();
  const isEdit = !!route;
  // Authors' edits send an approved/rejected route back to review
  const sendsToReview = isEdit && !isStaff(authUser) && route.status !== "pending";
  const createRouteMutation = useRoutesCreateMutation();
  const updateRouteMutation = useRoutesUpdateMutation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: route?.title ?? "",
    description: route?.description ?? "",
    difficulty: (route?.difficulty ?? "moderate") as RouteInsert["difficulty"],
    distance_km: route ? Math.round(Number(route.distance_km)) : 100,
    duration_minutes: route?.duration_minutes ?? 120,
    elevation_gain_m: route?.elevation_gain_m ?? 500,
    region: route?.region ?? "",
    country: route?.country ?? "",
    route_type: (route?.route_type ?? "") as "loop" | "out_and_back" | "",
    category: (route?.category ?? "scenic") as RouteInsert["category"],
  });

  const [gpxData, setGpxData] = useState<GPXData | null>(null);
  // New routes: points of interest from the GPX become the route's stops
  const [gpxStops, setGpxStops] = useState<GPXWaypoint[]>([]);
  const tTypes = useTranslations("stopTypes");
  const [gpxFile, setGpxFile] = useState<File | null>(null);
  // Remounts the GPX picker after a replaced track is saved
  const [gpxKey, setGpxKey] = useState(0);

  const handleGPXParsed = (parsedData: GPXData, file: File) => {
    setGpxData(parsedData);
    setGpxFile(file);
    setGpxStops(parsedData.waypoints ?? []);

    // Auto-populate form fields from GPX data
    setFormData((prev) => ({
      ...prev,
      distance_km: Math.round(parsedData.totalDistance),
      elevation_gain_m: Math.round(parsedData.elevationGain),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError(t("loginRequired"));
        setLoading(false);
        return;
      }

      if (route) {
        await saveEdit(route);
        return;
      }

      // Validate GPX file
      if (!gpxData) {
        setError(t("gpxRequired"));
        setLoading(false);
        return;
      }

      // Convert GPX data to polyline coordinates
      const polyline_coordinates = gpxPointsToGeoJSON(gpxData.points);
      const routeData: RouteInsert = {
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        difficulty: formData.difficulty,
        distance_km: formData.distance_km,
        duration_minutes: formData.duration_minutes,
        elevation_gain_m: formData.elevation_gain_m,
        polyline_coordinates,
        region: formData.region || null,
        country: formData.country || null,
        route_type: formData.route_type || null,
        thumbnail_url: null,
        category: formData.category,
      };

      const result = await createRouteMutation.mutateAsync(routeData);
      // Let the curators know there is a new route to review (fire-and-forget).
      fetch("/api/routes/notify-curator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routeId: result.id }),
      }).catch((e) => console.warn("Could not notify curators:", e));
      // Static OpenStreetMap image of the route (used for social previews).
      // A failure here must not fail the submission.
      try {
        const image = await renderRouteThumbnail(gpxData.points);
        const publicThumbnail = await RouteStorage.uploadRouteThumbnail(image, result.id);
        await updateRouteMutation.mutateAsync({
          id: result.id,
          routeData: { thumbnail_url: publicThumbnail },
        });
      } catch (thumbError) {
        console.warn("Could not create route thumbnail:", thumbError);
      }
      // Stops from the GPX. A failure here must not fail the submission:
      // the author can still add them in the route editor.
      if (gpxStops.length) {
        try {
          await RoutesService.saveStops(
            result.id,
            gpxStops.map((w) => ({
              name: w.name.slice(0, 120),
              description: w.description || null,
              type: w.type as StopType,
              latitude: w.lat,
              longitude: w.lng,
            })),
          );
        } catch (stopsError) {
          console.warn("Could not save the GPX stops:", stopsError);
        }
      }
      setSuccess(true);

      // New routes wait for review: show them in "My routes"
      setTimeout(() => {
        router.push(`/${locale}/profile#my-routes`);
      }, 2500);
    } catch (err) {
      console.error("Error submitting route:", err);
      setError(err instanceof Error ? err.message : t("errorMessage"));
    } finally {
      setLoading(false);
    }
  };

  const saveEdit = async (current: RouteWithDetails) => {
    const updates: Database["public"]["Tables"]["routes"]["Update"] = {
      title: formData.title,
      description: formData.description || null,
      difficulty: formData.difficulty,
      distance_km: formData.distance_km,
      duration_minutes: formData.duration_minutes,
      elevation_gain_m: formData.elevation_gain_m,
      region: formData.region || null,
      country: formData.country || null,
      route_type: formData.route_type || null,
      category: formData.category,
    };
    if (gpxData) {
      updates.polyline_coordinates = gpxPointsToGeoJSON(gpxData.points);
    }

    let saved = await updateRouteMutation.mutateAsync({
      id: current.id,
      routeData: updates,
    });

    if (gpxData) {
      try {
        const image = await renderRouteThumbnail(gpxData.points);
        const url = await RouteStorage.uploadRouteThumbnail(image, current.id);
        // Bust caches: the file name doesn't change
        saved = await updateRouteMutation.mutateAsync({
          id: current.id,
          routeData: { thumbnail_url: `${url}?v=${Date.now()}` },
        });
      } catch (thumbError) {
        console.warn("Could not update route thumbnail:", thumbError);
      }
      setGpxData(null);
      setGpxFile(null);
      setGpxKey((k) => k + 1);
    }

    onSaved?.({ ...current, ...saved });
  };

  if (success) {
    return (
      <Card className="p-12 text-center">
        <div className="space-y-4">
          <div className="text-6xl">✅</div>
          <h3 className="text-2xl font-bold">{t("successTitle")}</h3>
          <p className="text-muted-foreground">{t("successPendingMessage")}</p>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">{t("basicInfo")}</h2>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">
            {t("routeTitle")}{" "}
            <span className="text-destructive">{t("required")}</span>
          </Label>
          <Input
            id="title"
            required
            placeholder={t("routeTitlePlaceholder")}
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">{t("description")}</Label>
          <textarea
            id="description"
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={t("descriptionPlaceholder")}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        {/* Region */}
        <div className="space-y-2">
          <Label htmlFor="region">{t("region")}</Label>
          <Input
            id="region"
            placeholder={t("regionPlaceholder")}
            value={formData.region}
            onChange={(e) =>
              setFormData({ ...formData, region: e.target.value })
            }
          />
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="country">{t("country")}</Label>
          <select
            id="country"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
          >
            <option value="">{t("countryPlaceholder")}</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {countryName(c, locale)}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Route Characteristics */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">{t("routeCharacteristics")}</h2>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">
            {t("category")}{" "}
            <span className="text-destructive">{t("required")}</span>
          </Label>
          <select
            id="category"
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={formData.category}
            onChange={(e) =>
              setFormData({
                ...formData,
                category: e.target.value as RouteInsert["category"],
              })
            }
          >
            <option value="scenic">{t("categoryScenicLabel")}</option>
            <option value="mountain">{t("categoryMountainLabel")}</option>
            <option value="coastal">{t("categoryCoastalLabel")}</option>
            <option value="weekend">{t("categoryWeekendLabel")}</option>
            <option value="adventure">{t("categoryAdventureLabel")}</option>
          </select>
        </div>

        {/* Route Type */}
        <div className="space-y-2">
          <Label htmlFor="route_type">{t("routeType")}</Label>
          <select
            id="route_type"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={formData.route_type}
            onChange={(e) =>
              setFormData({
                ...formData,
                route_type: e.target.value as "loop" | "out_and_back" | "",
              })
            }
          >
            <option value="">{t("routeTypePlaceholder")}</option>
            <option value="loop">{t("routeTypeLoop")}</option>
            <option value="out_and_back">{t("routeTypeOutAndBack")}</option>
          </select>
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <Label htmlFor="difficulty">
            {t("difficultyLabel")}{" "}
            <span className="text-destructive">{t("required")}</span>
          </Label>
          <select
            id="difficulty"
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({
                ...formData,
                difficulty: e.target.value as RouteInsert["difficulty"],
              })
            }
          >
            <option value="easy">{t("difficultyEasyLabel")}</option>
            <option value="moderate">{t("difficultyModerateLabel")}</option>
            <option value="challenging">
              {t("difficultyChallengingLabel")}
            </option>
            <option value="expert">{t("difficultyExpertLabel")}</option>
          </select>
        </div>

        {/* Distance */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="distance">
              {t("distanceLabel")}{" "}
              <span className="text-destructive">{t("required")}</span>
            </Label>
            <span className="text-sm font-medium">
              {formData.distance_km} {t("distanceUnit")}
            </span>
          </div>
          <Slider
            id="distance"
            min={10}
            max={sliderMax(500, formData.distance_km, 50)}
            step={5}
            value={[formData.distance_km]}
            onValueChange={([value]) =>
              setFormData({ ...formData, distance_km: value })
            }
          />
        </div>

        {/* Duration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="duration">
              {t("durationLabel")}{" "}
              <span className="text-destructive">{t("required")}</span>
            </Label>
            <span className="text-sm font-medium">
              {t("durationFormat", {
                hours: Math.floor(formData.duration_minutes / 60),
                minutes: formData.duration_minutes % 60,
              })}
            </span>
          </div>
          <Slider
            id="duration"
            min={30}
            max={sliderMax(720, formData.duration_minutes, 60)}
            step={15}
            value={[formData.duration_minutes]}
            onValueChange={([value]) =>
              setFormData({ ...formData, duration_minutes: value })
            }
          />
        </div>

        {/* Elevation Gain */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="elevation">{t("elevationLabel")}</Label>
            <span className="text-sm font-medium">
              {formData.elevation_gain_m} {t("elevationUnit")}
            </span>
          </div>
          <Slider
            id="elevation"
            min={0}
            max={sliderMax(3000, formData.elevation_gain_m, 500)}
            step={50}
            value={[formData.elevation_gain_m]}
            onValueChange={([value]) =>
              setFormData({ ...formData, elevation_gain_m: value })
            }
          />
        </div>
      </Card>

      {/* GPX File Upload */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">
          {isEdit ? tEdit("replaceGpx") : t("gpxFile")}
        </h2>
        {isEdit && (
          <p className="text-sm text-muted-foreground">{tEdit("replaceGpxHint")}</p>
        )}
        <GPXUpload key={gpxKey} onGPXParsed={handleGPXParsed} locale={locale} />
      </Card>

      {/* Stops found in the GPX (new routes only) */}
      {!isEdit && gpxStops.length > 0 && (
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{t("gpxStops.title", { count: gpxStops.length })}</h2>
            <p className="text-sm text-muted-foreground">{t("gpxStops.description")}</p>
          </div>
          <ol className="space-y-3">
            {gpxStops.map((stop, i) => (
              <li key={`${stop.lat},${stop.lng},${i}`} className="flex gap-3 rounded-md border p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{stop.name}</span>
                    <select
                      aria-label={t("gpxStops.type")}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      value={stop.type}
                      onChange={(e) =>
                        setGpxStops((prev) =>
                          prev.map((s, j) => (j === i ? { ...s, type: e.target.value as GPXWaypoint["type"] } : s)),
                        )
                      }
                    >
                      {(["viewpoint", "cafe", "gas_station", "restaurant", "landmark", "accommodation"] as const).map((type) => (
                        <option key={type} value={type}>
                          {tTypes(type)}
                        </option>
                      ))}
                    </select>
                    {stop.distanceFromRouteKm > 2 && (
                      <span className="text-xs text-amber-600">
                        {t("gpxStops.farFromRoute", { km: stop.distanceFromRouteKm })}
                      </span>
                    )}
                  </div>
                  {stop.description && <p className="text-sm text-muted-foreground">{stop.description}</p>}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  title={t("gpxStops.remove")}
                  aria-label={t("gpxStops.remove")}
                  onClick={() => setGpxStops((prev) => prev.filter((_, j) => j !== i))}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ol>
          <p className="text-xs text-muted-foreground">{t("gpxStops.editLater")}</p>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      {sendsToReview && (
        <Card className="p-4 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
          <p className="text-sm text-amber-800 dark:text-amber-300">{tEdit("reviewWarning")}</p>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
        >
          {t("cancel")}
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("submitting")}
            </>
          ) : isEdit ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              {tEdit("save")}
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              {t("submitButton")}
            </>
          )}
        </Button>
      </div>

      {/* Info */}
      <Card className={isEdit ? "hidden" : "p-4 bg-muted"}>
        <p className="text-xs text-muted-foreground">
          <strong>{t("noteTitle")}</strong> {t("noteMessage")}
        </p>
      </Card>
    </form>
  );
}
