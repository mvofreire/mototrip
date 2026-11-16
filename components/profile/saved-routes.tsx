"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RouteCard } from "@/components/features/routes/route-card";
import { SaveRouteButton } from "@/components/features/routes/save-route-button";
import { useSavedRoutes } from "@/hooks/use-saved-routes";
import { RouteCardsSkeleton } from "./route-cards-skeleton";

export function SavedRoutes() {
  const t = useTranslations("savedRoutes");
  const locale = useLocale();
  const { data: routes, isLoading, isError } = useSavedRoutes();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-2xl font-extrabold leading-none">{t("title")}</h2>
        <Button asChild size="sm" variant="outline">
          <Link href={`/${locale}/explore`}>
            <Compass className="mr-1.5 h-4 w-4" />
            {t("explore")}
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <RouteCardsSkeleton />
      ) : isError ? (
        <Card className="p-6 text-sm text-destructive">{t("error")}</Card>
      ) : !routes || routes.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">{t("empty")}</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => (
            <div key={route.id} className="space-y-2">
              <RouteCard route={route} locale={locale} />
              <SaveRouteButton routeId={route.id} className="w-full" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
