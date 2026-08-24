import "server-only";

/**
 * Fitbit's classic Web API (api.fitbit.com/oauth2/*) is being retired — Google (which now
 * owns Fitbit) moved wearable data behind the Google Health API instead, authenticated with
 * a plain Google Cloud OAuth 2.0 client rather than a Fitbit developer app. This file (and
 * lib/fitbit-sync.ts, which reads the actual data) targets that new API. The "Connect
 * Fitbit" label stays user-facing (see components/vitals/TrackerConnectCard.tsx) and the
 * FitnessConnection.provider value stays "fitbit" in the database, since that's still what
 * a reader understands is being connected — only the mechanism underneath changed.
 *
 * Verified against developers.google.com/health (get-started, scopes, reference/rest) as of
 * August 2026 — re-check that documentation if anything here starts failing, since this is a
 * genuinely new API surface, not a long-stable one.
 */

const GOOGLE_HEALTH_CLIENT_ID = process.env.GOOGLE_HEALTH_CLIENT_ID;
const GOOGLE_HEALTH_CLIENT_SECRET = process.env.GOOGLE_HEALTH_CLIENT_SECRET;

/** Must be added to this OAuth client's "Authorized redirect URIs" in the Google Cloud
 *  Console (APIs & Services → Credentials) — same exact-match requirement as
 *  lib/google-oauth.ts's GOOGLE_REDIRECT_URI, just a separate OAuth client since this scope
 *  is Restricted (requires its own Google review) and shouldn't be bundled with the
 *  ordinary "Sign in with Google" client. */
export const GOOGLE_HEALTH_REDIRECT_URI = "https://limbic.center/auth/fitbit/callback";

// Two scopes requested together in one consent screen — activity_and_fitness covers
// exercise sessions (see lib/fitbit-sync.ts), health_metrics_and_measurements covers the
// body/vitals readings lib/google-health-metrics-sync.ts reads (weight, height, heart rate,
// HRV, body fat, oxygen saturation, blood glucose). Both are Restricted scopes reviewed
// together under the same OAuth client (see lib/google-health-oauth.ts's file comment).
// Anyone who connected before this scope was added needs to disconnect and reconnect once —
// Google doesn't retroactively grant a newly-added scope to an already-issued token.
const SCOPE =
  "https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly " +
  "https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly";

export function googleHealthEnabled(): boolean {
  return !!GOOGLE_HEALTH_CLIENT_ID && !!GOOGLE_HEALTH_CLIENT_SECRET;
}

export function buildGoogleHealthAuthUrl(state: string): string {
  if (!GOOGLE_HEALTH_CLIENT_ID) throw new Error("GOOGLE_HEALTH_CLIENT_ID is not set");
  const params = new URLSearchParams({
    client_id: GOOGLE_HEALTH_CLIENT_ID,
    redirect_uri: GOOGLE_HEALTH_REDIRECT_URI,
    response_type: "code",
    access_type: "offline",
    // Forces Google to hand back a refresh_token even on a reader's second/third connect —
    // it otherwise only does that on the very first consent for a given account+scope.
    prompt: "consent",
    scope: SCOPE,
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export interface GoogleHealthTokens {
  accessToken: string;
  refreshToken: string;
  /** Epoch ms. */
  expiresAt: Date;
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

async function parseTokenResponse(res: Response, action: string, fallbackRefreshToken?: string): Promise<GoogleHealthTokens> {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Google Health ${action} failed (${res.status}): ${body.slice(0, 500)}`);
  }
  const data = (await res.json()) as GoogleTokenResponse;
  const refreshToken = data.refresh_token ?? fallbackRefreshToken;
  if (!refreshToken) throw new Error(`Google Health ${action} returned no refresh_token`);
  return {
    accessToken: data.access_token,
    refreshToken,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}

/** Exchanges an OAuth authorization code for Google Health access/refresh tokens (see
 *  app/auth/fitbit/callback/route.ts) — same token endpoint every Google OAuth2 client uses
 *  (lib/google-oauth.ts's Sign-in flow included), just a different client/scope/redirect. */
export async function exchangeGoogleHealthCode(code: string): Promise<GoogleHealthTokens> {
  if (!GOOGLE_HEALTH_CLIENT_ID || !GOOGLE_HEALTH_CLIENT_SECRET) throw new Error("Google Health sync is not configured");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_HEALTH_CLIENT_ID,
      client_secret: GOOGLE_HEALTH_CLIENT_SECRET,
      redirect_uri: GOOGLE_HEALTH_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });
  return parseTokenResponse(res, "token exchange");
}

/** Refreshes an expired/expiring access token — Google doesn't rotate the refresh token on
 *  every use (unlike Fitbit/Strava's own refresh tokens), so the caller keeps the existing
 *  one unless Google happens to send a new one. */
export async function refreshGoogleHealthToken(refreshToken: string): Promise<GoogleHealthTokens> {
  if (!GOOGLE_HEALTH_CLIENT_ID || !GOOGLE_HEALTH_CLIENT_SECRET) throw new Error("Google Health sync is not configured");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_HEALTH_CLIENT_ID,
      client_secret: GOOGLE_HEALTH_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  return parseTokenResponse(res, "token refresh", refreshToken);
}

/** Best-effort revoke on disconnect — the standard Google OAuth2 revoke endpoint, shared by
 *  every Google API client (not Health-specific). Same "don't block disconnect on it"
 *  reasoning as lib/strava-oauth.ts's deauthorizeStrava. */
export async function revokeGoogleHealthToken(token: string): Promise<void> {
  await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, { method: "POST" }).catch(() => {});
}
