import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCode } from "@/lib/google-oauth";
import { signInWithGoogle } from "@/lib/session";

const STATE_COOKIE = "google_oauth_state";

/** Completes "Sign in with Google" — verifies the state cookie set by
 *  app/auth/google/route.ts, exchanges the authorization code for a verified ID token, and
 *  signs the reader in (or creates their account, on a first visit) by the token's verified
 *  email. Redirects back to /sign-in with an `error` query param on any failure rather than
 *  a raw 500, so the reader always lands somewhere with a real page. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;

  function failure(reason: string) {
    const response = NextResponse.redirect(new URL(`/sign-in?error=${reason}`, request.url));
    response.cookies.delete(STATE_COOKIE);
    return response;
  }

  // A reader who clicked "Cancel" on Google's consent screen comes back with no `code` at
  // all (and usually an `error=access_denied` param) rather than an empty/invalid one.
  if (!code) return failure("google_denied");
  if (!expectedState || !returnedState || expectedState !== returnedState) return failure("google_state_mismatch");

  try {
    const { email, name } = await exchangeGoogleCode(code);
    await signInWithGoogle({ email, name });
  } catch (err) {
    console.error("[auth/google/callback]", err);
    return failure("google_failed");
  }

  const response = NextResponse.redirect(new URL("/home", request.url));
  response.cookies.delete(STATE_COOKIE);
  return response;
}
