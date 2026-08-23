import { NextRequest, NextResponse } from "next/server";
import { exchangeFitbitCode } from "@/lib/fitbit-oauth";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { syncFitbitForUser } from "@/lib/fitbit-sync";

const STATE_COOKIE = "fitbit_oauth_state";

/** Completes "Connect Fitbit" — verifies the state cookie set by app/auth/fitbit/route.ts,
 *  exchanges the code for tokens, and stores them as this account's FitnessConnection (see
 *  schema.prisma). Runs an immediate sync so the Activity Log has something to show right
 *  away rather than the reader waiting for tomorrow's cron. Redirects back to the Activity
 *  Log with an `error` query param on any failure, same pattern as Google's own callback. */
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
  if (!user) return failure("fitbit_signed_out");
  if (!code) return failure("fitbit_denied");
  if (!expectedState || !returnedState || expectedState !== returnedState) return failure("fitbit_state_mismatch");

  try {
    const tokens = await exchangeFitbitCode(code);
    await prisma.fitnessConnection.upsert({
      where: { userId_provider: { userId: user.id, provider: "fitbit" } },
      create: {
        userId: user.id,
        provider: "fitbit",
        externalId: tokens.userId,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      },
      update: {
        externalId: tokens.userId,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      },
    });
    await syncFitbitForUser(user.id);
  } catch (err) {
    console.error("[auth/fitbit/callback]", err);
    return failure("fitbit_failed");
  }

  const response = NextResponse.redirect(new URL("/wellness/activity?connected=fitbit", request.url));
  response.cookies.delete(STATE_COOKIE);
  return response;
}
