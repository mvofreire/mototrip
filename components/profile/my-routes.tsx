"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RouteCard } from "@/components/features/routes/route-card";
import { RouteStatusBadge } from "@/components/features/routes/route-status-badge";
import { useMyRoutes } from "@/hooks/use-profile";
import { RouteCardsSkeleton } from "./route-cards-skeleton";

/** Routes the user submitted, with their review status */
export function MyRoutes() {
  const t = useTranslations("myRoutes");
  const tStatus = useTranslations("routeStatus");
  const locale = useLocale();
  const { data: routes, isLoading, isError } = useMyRoutes();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-2xl font-extrabold leading-none">{t("title")}</h2>
        <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href={`/${locale}/submit`}>
            <Plus className="mr-1.5 h-4 w-4" />
            {t("submit")}
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
              <div className="flex items-center justify-between gap-2">
                <RouteStatusBadge status={route.status} />
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/${locale}/routes/${route.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {tStatus("edit")}
                  </Link>
                </Button>
              </div>
              {route.status === "rejected" && route.review_note && (
                <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs dark:border-red-900 dark:bg-red-950/30">
                  <span className="font-medium">{tStatus("reason")}: </span>
                  {route.review_note}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
