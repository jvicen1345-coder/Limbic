import "server-only";

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

/** Must exactly match the "Authorization Callback Domain" registered on the app at
 *  strava.com/settings/api — same hardcoded-to-production convention as
 *  GOOGLE_REDIRECT_URI in lib/google-oauth.ts. */
export const STRAVA_REDIRECT_URI = "https://limbic.center/auth/strava/callback";

export function stravaEnabled(): boolean {
  return !!STRAVA_CLIENT_ID && !!STRAVA_CLIENT_SECRET;
}

export function buildStravaAuthUrl(state: string): string {
  if (!STRAVA_CLIENT_ID) throw new Error("STRAVA_CLIENT_ID is not set");
  const params = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID,
    redirect_uri: STRAVA_REDIRECT_URI,
    response_type: "code",
    approval_prompt: "auto",
    scope: "activity:read_all",
    state,
  });
  return `https://www.strava.com/oauth/authorize?${params}`;
}

export interface StravaTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  /** Strava's numeric athlete id — reference only, same as Fitbit's userId. */
  athleteId: string;
}

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number; // epoch seconds, not a duration
  athlete?: { id: number };
}

async function parseStravaTokenResponse(res: Response, action: string, fallbackAthleteId?: string): Promise<StravaTokens> {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Strava ${action} failed (${res.status}): ${body.slice(0, 500)}`);
  }
  const data = (await res.json()) as StravaTokenResponse;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(data.expires_at * 1000),
    athleteId: data.athlete ? String(data.athlete.id) : (fallbackAthleteId ?? ""),
  };
}

/** Exchanges an OAuth authorization code for Strava access/refresh tokens (see
 *  app/auth/strava/callback/route.ts). Throws on failure; the caller turns that into a
 *  redirect back to the Activity Log with an `error` query param rather than a 500. */
export async function exchangeStravaCode(code: string): Promise<StravaTokens> {
  if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) throw new Error("Strava sync is not configured");
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
    }),
  });
  return parseStravaTokenResponse(res, "token exchange");
}

/** Refreshes an expired/expiring Strava access token (see lib/strava-sync.ts) — Strava
 *  rotates the refresh token on every use, so the caller must persist the new one too. */
export async function refreshStravaToken(refreshToken: string, athleteId: string): Promise<StravaTokens> {
  if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) throw new Error("Strava sync is not configured");
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  // Strava's refresh response doesn't repeat the athlete object, only the tokens.
  return parseStravaTokenResponse(res, "token refresh", athleteId);
}

/** Best-effort deauthorize on disconnect, same "don't block on it" reasoning as
 *  revokeFitbitToken in lib/fitbit-oauth.ts. */
export async function deauthorizeStrava(accessToken: string): Promise<void> {
  await fetch("https://www.strava.com/oauth/deauthorize", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ access_token: accessToken }),
  }).catch(() => {});
}
