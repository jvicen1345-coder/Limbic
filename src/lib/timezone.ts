import "server-only";
import { cookies } from "next/headers";

export const TIMEZONE_COOKIE = "tz";

/**
 * The visitor's local hour-of-day (0-23), for time-of-day copy like Home's "Good morning/
 * afternoon/evening" greeting (see lib/meta.ts timeOfDayGreeting, app/(app)/home/page.tsx).
 * Reads the IANA zone name from the `tz` cookie, set client-side the moment a signed-in
 * page first loads (see components/HomeFeed.tsx) via Intl.DateTimeFormat().resolvedOptions()
 * .timeZone — a cookie rather than localStorage specifically because this needs to be
 * readable server-side on the *next* request, the way localStorage never is during SSR.
 * Falls back to the server's own local time when the cookie is missing (the very first
 * page load before the client has had a chance to set it, or cookies disabled) or names an
 * unrecognized zone — same graceful-degradation shape as every other optional signal in
 * this app, and exactly today's pre-existing behavior for every date/time concept
 * elsewhere (see lib/reading-calendar.ts, components/CalendarCard.tsx), which deliberately
 * stays on the server's clock — this is scoped to the greeting alone, not a timezone
 * migration for the rest of the app.
 */
export async function visitorHourOfDay(): Promise<number> {
  const store = await cookies();
  const timeZone = store.get(TIMEZONE_COOKIE)?.value;
  if (!timeZone) return new Date().getHours();

  try {
    const formatted = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hour12: false }).format(new Date());
    return parseInt(formatted, 10) % 24;
  } catch {
    return new Date().getHours();
  }
}
