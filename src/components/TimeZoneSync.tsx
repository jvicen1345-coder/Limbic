"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { recordTimeZoneAction } from "@/app/actions/time-zone";

/** Tells the server what time zone this browser is actually in, so the calendar date every
 *  daily-rotating feature is keyed on is the reader's date and not the server's (see
 *  lib/day.ts for why that matters, lib/user-time-zone.ts for how it's read back).
 *
 *  Renders nothing and does nothing on the overwhelming majority of loads: it only calls
 *  the action when the browser's zone differs from the one the server just used, which is
 *  a reader's first visit, a cleared cookie, or someone who has travelled. When it does
 *  fire, it refreshes the route afterwards — the page above it was rendered against the
 *  wrong day, and for anyone whose date differs from the server's that means a stale
 *  question, streak or countdown that would otherwise sit there until the next navigation.
 *
 *  Reading Intl in an effect rather than during render is deliberate: the value doesn't
 *  exist server-side, so using it in the render path would make this component's output
 *  differ between the server and the client and trip hydration. */
export function TimeZoneSync({ serverTimeZone }: { serverTimeZone: string }) {
  const router = useRouter();
  // Guards against a second run in development's double-invoked effects, and against
  // re-firing when router.refresh() re-renders this component before the new server value
  // has propagated.
  const reported = useRef(false);

  useEffect(() => {
    if (reported.current) return;
    const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!browserZone || browserZone === serverTimeZone) return;
    reported.current = true;
    void recordTimeZoneAction(browserZone).then(() => router.refresh());
  }, [serverTimeZone, router]);

  return null;
}
