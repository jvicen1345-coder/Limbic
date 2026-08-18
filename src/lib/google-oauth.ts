import "server-only";
import { jwtVerify, createRemoteJWKSet } from "jose";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

/** Must exactly match one of the "Authorized redirect URIs" configured on the OAuth client
 *  in Google Cloud Console — hardcoded to the production domain (same convention as the
 *  literal "limbic.center" already used in this app's share-text strings) rather than
 *  derived from the incoming request, so the round trip completes the same way regardless
 *  of what host actually served the initial request (a Vercel preview URL, a local dev
 *  server) instead of failing to match a redirect_uri Google never saw registered. */
export const GOOGLE_REDIRECT_URI = "https://limbic.center/auth/google/callback";

/** Whether both Google OAuth env vars are configured — gates showing the "Continue with
 *  Google" button at all (see components/SignInForm.tsx) and the /auth/google route
 *  handlers, same graceful-degradation pattern as YOUTUBE_API_KEY/ANTHROPIC_API_KEY
 *  elsewhere in this app. */
export function googleSignInEnabled(): boolean {
  return !!GOOGLE_CLIENT_ID && !!GOOGLE_CLIENT_SECRET;
}

/** Builds the Google OAuth consent-screen URL for app/auth/google/route.ts to redirect to.
 *  `state` is a random per-attempt value the caller stashes in a short-lived cookie and
 *  compares against what Google sends back, to guard the callback against CSRF. */
export function buildGoogleAuthUrl(state: string): string {
  if (!GOOGLE_CLIENT_ID) throw new Error("GOOGLE_CLIENT_ID is not set");
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    state,
    // Lets a reader with more than one Google account pick which one, rather than silently
    // signing in with whichever is currently active in their browser.
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

interface GoogleIdTokenClaims {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
}

// Google's public signing keys, fetched (and cached internally by jose) on first use rather
// than at module load, so importing this file has no I/O side effect of its own.
const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

/**
 * Exchanges an OAuth authorization code for Google's ID token and cryptographically verifies
 * it (signature against Google's own published keys, issuer, audience) before trusting any
 * of its claims — never decodes the token without verifying, since an unverified JWT is just
 * attacker-controlled JSON. Throws on any failure; the caller (app/auth/google/callback/
 * route.ts) turns that into a redirect back to /sign-in with an error rather than a 500.
 */
export async function exchangeGoogleCode(code: string): Promise<{ email: string; name: string | null; sub: string }> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) throw new Error("Google sign-in is not configured");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Google token exchange failed (${res.status}): ${body.slice(0, 500)}`);
  }

  const { id_token } = (await res.json()) as { id_token?: string };
  if (!id_token) throw new Error("Google token response had no id_token");

  const { payload } = await jwtVerify(id_token, GOOGLE_JWKS, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: GOOGLE_CLIENT_ID,
  });
  const claims = payload as GoogleIdTokenClaims;
  if (!claims.email || !claims.email_verified) throw new Error("Google account has no verified email");
  if (!claims.sub) throw new Error("Google ID token had no sub claim");

  return { email: claims.email, name: claims.name ?? null, sub: claims.sub };
}
