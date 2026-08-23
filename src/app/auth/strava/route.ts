import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { buildStravaAuthUrl, stravaEnabled } from "@/lib/strava-oauth";
import { getCurrentUser } from "@/lib/session";

const STATE_COOKIE = "strava_oauth_state";
const STATE_COOKIE_MAX_AGE = 600;

/** Kicks off "Connect Strava" — same "connect onto an existing Limbic session" shape as
 *  app/auth/fitbit/route.ts, see that file's comment for why this differs from
 *  app/auth/google/route.ts's sign-in flow. */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/sign-in", request.url));
  if (!stravaEnabled()) {
    return NextResponse.redirect(new URL("/wellness/activity?error=strava_not_configured", request.url));
  }

  const state = randomUUID();
  const response = NextResponse.redirect(buildStravaAuthUrl(state));
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STATE_COOKIE_MAX_AGE,
  });
  return response;
}
