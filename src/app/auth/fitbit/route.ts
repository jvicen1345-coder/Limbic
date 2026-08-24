import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { buildGoogleHealthAuthUrl, googleHealthEnabled } from "@/lib/google-health-oauth";
import { getCurrentUser } from "@/lib/session";

const STATE_COOKIE = "fitbit_oauth_state";
const STATE_COOKIE_MAX_AGE = 600; // 10 minutes — same window as Google's own state cookie.

/** Kicks off "Connect Fitbit" (see components/vitals/TrackerConnectCard.tsx) — unlike
 *  app/auth/google/route.ts, this connects an *additional* account onto an existing,
 *  already-signed-in Limbic session rather than signing the reader into Limbic itself, so
 *  it requires getCurrentUser() to succeed before redirecting to Google's consent screen
 *  (see lib/google-health-oauth.ts for why this is a Google OAuth flow, not Fitbit's own). */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/sign-in", request.url));
  if (!googleHealthEnabled()) {
    return NextResponse.redirect(new URL("/wellness/activity?error=fitbit_not_configured", request.url));
  }

  const state = randomUUID();
  const response = NextResponse.redirect(buildGoogleHealthAuthUrl(state));
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STATE_COOKIE_MAX_AGE,
  });
  return response;
}
