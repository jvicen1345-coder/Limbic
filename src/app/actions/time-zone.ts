"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isValidTimeZone } from "@/lib/day";
import { TIME_ZONE_COOKIE, TIME_ZONE_COOKIE_MAX_AGE } from "@/lib/user-time-zone";

/** Records the reader's IANA time zone as their browser reports it (see
 *  components/TimeZoneSync.tsx). Writes both places lib/user-time-zone.ts looks: the
 *  cookie, so the very next request is already right even before any user row is read, and
 *  the account, so it follows them to another device or survives cleared site data.
 *
 *  `timeZone` arrives from the client like any Server Action argument, so it is validated
 *  here rather than trusted — an unrecognized zone makes Intl throw, and this value is fed
 *  to a formatter on nearly every page render. Signed-out callers still get the cookie:
 *  it's the only place to put it, and it is a display preference, not an authorization. */
export async function recordTimeZoneAction(timeZone: string) {
  if (typeof timeZone !== "string" || !isValidTimeZone(timeZone)) return;

  (await cookies()).set(TIME_ZONE_COOKIE, timeZone, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TIME_ZONE_COOKIE_MAX_AGE,
  });

  const user = await getCurrentUser();
  if (!user || user.timeZone === timeZone) return;
  await prisma.user.update({ where: { id: user.id }, data: { timeZone } });
}
