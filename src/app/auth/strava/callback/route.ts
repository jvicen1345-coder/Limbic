import { NextRequest, NextResponse } from "next/server";
import { exchangeStravaCode } from "@/lib/strava-oauth";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { syncStravaForUser } from "@/lib/strava-sync";

const STATE_COOKIE = "strava_oauth_state";

/** Completes "Connect Strava" — same shape as app/auth/fitbit/callback/route.ts, see that
 *  file's comment. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;

  function failure(reason: string) {
    const response = NextResponse.redirect(new URL(`/wellness/activity?error=${reason}`, request.url));
    response.cookies.delete(STATE_COOKIE);
    return response;
  }

  const user = await getCurrentUser();
  if (!user) return failure("strava_signed_out");
  if (!code) return failure("strava_denied");
  if (!expectedState || !returnedState || expectedState !== returnedState) return failure("strava_state_mismatch");

  try {
    const tokens = await exchangeStravaCode(code);
    await prisma.fitnessConnection.upsert({
      where: { userId_provider: { userId: user.id, provider: "strava" } },
      create: {
        userId: user.id,
        provider: "strava",
        externalId: tokens.athleteId,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      },
      update: {
        externalId: tokens.athleteId,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      },
    });
    await syncStravaForUser(user.id);
  } catch (err) {
    console.error("[auth/strava/callback]", err);
    return failure("strava_failed");
  }

  const response = NextResponse.redirect(new URL("/wellness/activity?connected=strava", request.url));
  response.cookies.delete(STATE_COOKIE);
  return response;
}
