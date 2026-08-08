import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { buildGoogleAuthUrl, googleSignInEnabled } from "@/lib/google-oauth";

const STATE_COOKIE = "google_oauth_state";
const STATE_COOKIE_MAX_AGE = 600; // 10 minutes — plenty for a reader to actually complete the consent screen.

/** Kicks off "Sign in with Google" (see components/SignInForm.tsx's "Continue with Google"
 *  link) — redirects to Google's consent screen with a random state value stashed in a
 *  short-lived cookie, checked against on the way back in
 *  app/auth/google/callback/route.ts to guard against CSRF. */
export async function GET(request: NextRequest) {
  if (!googleSignInEnabled()) {
    return NextResponse.redirect(new URL("/sign-in?error=google_not_configured", request.url));
  }

  const state = randomUUID();
  const response = NextResponse.redirect(buildGoogleAuthUrl(state));
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STATE_COOKIE_MAX_AGE,
  });
  return response;
}
