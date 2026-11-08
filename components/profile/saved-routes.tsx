"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Bookmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RouteCard } from "@/components/features/routes/route-card";
import { SaveRouteButton } from "@/components/features/routes/save-route-button";
import { useSavedRoutes } from "@/hooks/use-saved-routes";

export function SavedRoutes() {
  const t = useTranslations("savedRoutes");
  const locale = useLocale();
  const { data: routes, isLoading, isError } = useSavedRoutes();

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Bookmark className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        {routes && routes.length > 0 && (
          <span className="text-muted-foreground">({routes.length})</span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <Card className="p-6 text-sm text-destructive">{t("error")}</Card>
      ) : !routes || routes.length === 0 ? (
        <Card className="p-8 text-center space-y-4">
          <p className="text-muted-foreground">{t("empty")}</p>
          <Button asChild variant="outline">
            <Link href={`/${locale}/explore`}>{t("explore")}</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
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
