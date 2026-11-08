"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useSavedRouteIds, useToggleSavedRoute } from "@/hooks/use-saved-routes";
import { cn } from "@/lib/utils";

interface SaveRouteButtonProps {
  routeId: string;
  className?: string;
}

export function SaveRouteButton({ routeId, className }: SaveRouteButtonProps) {
  const t = useTranslations("route");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { data: savedIds, isLoading: idsLoading } = useSavedRouteIds();
  const toggle = useToggleSavedRoute();

  const isSaved = savedIds?.has(routeId) ?? false;
  const busy = authLoading || (!!user && idsLoading);

  const handleClick = () => {
    if (!user) {
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    toggle.mutate({ routeId, save: !isSaved });
  };

  const Icon = busy ? Loader2 : isSaved ? BookmarkCheck : Bookmark;

  return (
    <Button
      onClick={handleClick}
      disabled={busy}
      aria-pressed={isSaved}
      title={!user && !authLoading ? t("loginToSave") : undefined}
      variant={isSaved ? "outline" : "default"}
      className={cn(
        "text-sm md:text-base",
        !isSaved && "bg-gradient-sunshine hover:opacity-90",
        className,
      )}
    >
      <Icon
        className={cn(
          "h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2",
          busy && "animate-spin",
          isSaved && "fill-current",
        )}
      />
      {isSaved ? t("savedRoute") : t("saveRoute")}
    </Button>
  );
}
