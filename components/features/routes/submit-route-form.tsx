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
import { Loader2, MapPin } from "lucide-react";
import type { Database } from "@/types/database.types";
import { GPXUpload } from "./gpx-upload";
import { gpxPointsToGeoJSON, type GPXData } from "@/lib/gpx-parser";
import { useRoutesCreateMutation, useRoutesUpdateMutation } from "@/hooks/use-routes";
import { RouteStorage } from "@/lib/storage/storage.service";

type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];

interface SubmitRouteFormProps {
  locale: string;
}

export function SubmitRouteForm({ locale }: SubmitRouteFormProps) {
  const t = useTranslations("submit");
  const router = useRouter();
  const createRouteMutation = useRoutesCreateMutation();
  const updateRouteMutation = useRoutesUpdateMutation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "moderate" as RouteInsert["difficulty"],
    distance_km: 100,
    duration_minutes: 120,
    elevation_gain_m: 500,
    region: "",
    country: "",
    route_type: "" as "loop" | "out_and_back" | "",
    category: "scenic" as RouteInsert["category"],
  });

  const [gpxData, setGpxData] = useState<GPXData | null>(null);
  const [gpxFile, setGpxFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const handleGPXParsed = (
    parsedData: GPXData,
    file: File,
    thumbnail?: string,
  ) => {
    setGpxData(parsedData);
    setGpxFile(file);
    setThumbnailUrl(thumbnail || null);

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
        thumbnail_url: thumbnailUrl,
        category: formData.category,
        scenic_score: 0,
        road_quality_score: 0,
        fun_factor_score: 0,
        published: true,
      };

      const result = await createRouteMutation.mutateAsync(routeData);
      const publicThumbnail = await RouteStorage.createRouteThumbnail(thumbnailUrl!, result.id);
      // update route with thumbnail url
      await updateRouteMutation.mutateAsync({
        id: result.id,
        routeData: {
          thumbnail_url: publicThumbnail,
        }
      });
      setSuccess(true);

      // Redirect to explore page after 2 seconds
      setTimeout(() => {
        router.push(`/${locale}/explore`);
      }, 2000);
    } catch (err) {
      console.error("Error submitting route:", err);
      setError(err instanceof Error ? err.message : t("errorMessage"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="p-12 text-center">
        <div className="space-y-4">
          <div className="text-6xl">✅</div>
          <h3 className="text-2xl font-bold">{t("successTitle")}</h3>
          <p className="text-muted-foreground">{t("successMessage")}</p>
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
            <option value="PT">🇵🇹 {t("countryPortugal")}</option>
            <option value="ES">🇪🇸 {t("countrySpain")}</option>
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
            max={500}
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
            max={720}
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
            max={3000}
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
        <h2 className="text-xl font-semibold">{t("gpxFile")}</h2>
        <GPXUpload onGPXParsed={handleGPXParsed} locale={locale} />
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive">
          <p className="text-sm text-destructive">{error}</p>
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
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              {t("submitButton")}
            </>
          )}
        </Button>
      </div>

      {/* Info */}
      <Card className="p-4 bg-muted">
        <p className="text-xs text-muted-foreground">
          <strong>{t("noteTitle")}</strong> {t("noteMessage")}
        </p>
      </Card>
    </form>
  );
}
