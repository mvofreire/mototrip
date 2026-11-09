"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Pencil, Route as RouteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RouteCard } from "@/components/features/routes/route-card";
import { RouteStatusBadge } from "@/components/features/routes/route-status-badge";
import { RoutesService } from "@/lib/services/routes.service";
import { useAuth } from "@/hooks/use-auth";

/** Routes the user submitted, with their review status */
export function MyRoutes() {
  const t = useTranslations("myRoutes");
  const tStatus = useTranslations("routeStatus");
  const locale = useLocale();
  const { user } = useAuth();
  const { data: routes, isLoading, isError } = useQuery({
    queryKey: ["my-routes", user?.id],
    queryFn: () => RoutesService.getUserRoutes(user!.id),
    enabled: !!user,
  });

  return (
    <section id="my-routes" className="space-y-4 scroll-mt-24">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <RouteIcon className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">{t("title")}</h2>
          {routes && routes.length > 0 && (
            <span className="text-muted-foreground">({routes.length})</span>
          )}
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={`/${locale}/submit`}>{t("submit")}</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <Card className="p-6 text-sm text-destructive">{t("error")}</Card>
      ) : !routes || routes.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">{t("empty")}</Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
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
