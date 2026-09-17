"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Keeps the "tz" cookie lib/timezone.ts reads (server-side, for Home's time-of-day greeting)
 * in sync with the browser's IANA zone. Mounted on Home only — the greeting is the only
 * consumer, and /home is the first signed-in landing page.
 */
export function HomeTimeZoneCookie() {
  const router = useRouter();

  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const stored = document.cookie.match(/(?:^|;\s*)tz=([^;]*)/)?.[1];
    if (stored === encodeURIComponent(zone)) return;
    document.cookie = `tz=${encodeURIComponent(zone)}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
    // Mount-only — not meant to re-run on route changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
