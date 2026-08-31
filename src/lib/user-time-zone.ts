import "server-only";
import { cookies, headers } from "next/headers";
import { DEFAULT_TIME_ZONE, isValidTimeZone } from "@/lib/day";

/** Where a browser-reported zone is parked so the *next* server render already knows it.
 *  A cookie rather than only the User row because the row needs a round trip to be written
 *  and read back, while this is set client-side and is on the very next request — and
 *  because it is what a signed-out or brand-new session has instead of a row. */
export const TIME_ZONE_COOKIE = "limbic_tz";

/** A year: the zone changes when someone travels or moves, not on a schedule, and
 *  components/TimeZoneSync.tsx rewrites the cookie whenever the browser disagrees with it. */
export const TIME_ZONE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** The IANA zone to treat as "this reader's clock" for the current request.
 *
 *  In order:
 *  1. The zone on their account, once a browser has reported one — the only source that
 *     follows them to a new device or a cleared cookie.
 *  2. The cookie, which is what a first visit has before that write has landed, and what a
 *     signed-out request has at all.
 *  3. `x-vercel-ip-timezone`, the edge's geo guess. Only a guess (a VPN or a corporate
 *     egress will name the wrong place), so it ranks below anything the browser itself
 *     said — but it is right far more often than UTC is, and it is available on the very
 *     first render of a brand-new account, before any client code has run.
 *  4. UTC, which is what every dateKey in this app was computed from before this existed.
 *
 *  Pass `user` when the caller already has one; it saves this from re-reading the session
 *  and keeps the account zone ranked first. */
export async function getTimeZone(user?: { timeZone: string | null } | null): Promise<string> {
  if (user?.timeZone && isValidTimeZone(user.timeZone)) return user.timeZone;

  const cookieZone = (await cookies()).get(TIME_ZONE_COOKIE)?.value;
  if (cookieZone && isValidTimeZone(cookieZone)) return cookieZone;

  const headerZone = (await headers()).get("x-vercel-ip-timezone");
  if (headerZone && isValidTimeZone(headerZone)) return headerZone;

  return DEFAULT_TIME_ZONE;
}
