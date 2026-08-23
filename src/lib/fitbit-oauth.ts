import "server-only";

const FITBIT_CLIENT_ID = process.env.FITBIT_CLIENT_ID;
const FITBIT_CLIENT_SECRET = process.env.FITBIT_CLIENT_SECRET;

/** Must exactly match a "Redirect URL" registered on the app at dev.fitbit.com/apps —
 *  same hardcoded-to-production convention as GOOGLE_REDIRECT_URI in lib/google-oauth.ts. */
export const FITBIT_REDIRECT_URI = "https://limbic.center/auth/fitbit/callback";

/** Whether both Fitbit OAuth env vars are configured — gates showing the "Connect Fitbit"
 *  button at all (see components/vitals/TrackerConnectCard.tsx) and the /auth/fitbit route
 *  handlers, same graceful-degradation pattern as googleSignInEnabled(). */
export function fitbitEnabled(): boolean {
  return !!FITBIT_CLIENT_ID && !!FITBIT_CLIENT_SECRET;
}

export function buildFitbitAuthUrl(state: string): string {
  if (!FITBIT_CLIENT_ID) throw new Error("FITBIT_CLIENT_ID is not set");
  const params = new URLSearchParams({
    client_id: FITBIT_CLIENT_ID,
    redirect_uri: FITBIT_REDIRECT_URI,
    response_type: "code",
    scope: "activity",
    state,
  });
  return `https://www.fitbit.com/oauth2/authorize?${params}`;
}

export interface FitbitTokens {
  accessToken: string;
  refreshToken: string;
  /** Epoch ms. */
  expiresAt: Date;
  /** Fitbit's own numeric-looking user id, encoded_id form — kept for reference only, this
   *  app never signs a Limbic account in with it (unlike Google's sub claim). */
  userId: string;
}

interface FitbitTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user_id: string;
}

function fitbitBasicAuthHeader(): string {
  return `Basic ${Buffer.from(`${FITBIT_CLIENT_ID}:${FITBIT_CLIENT_SECRET}`).toString("base64")}`;
}

async function parseFitbitTokenResponse(res: Response, action: string): Promise<FitbitTokens> {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Fitbit ${action} failed (${res.status}): ${body.slice(0, 500)}`);
  }
  const data = (await res.json()) as FitbitTokenResponse;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    userId: data.user_id,
  };
}

/** Exchanges an OAuth authorization code for Fitbit access/refresh tokens (see
 *  app/auth/fitbit/callback/route.ts). Throws on failure; the caller turns that into a
 *  redirect back to the Activity Log with an `error` query param rather than a 500. */
export async function exchangeFitbitCode(code: string): Promise<FitbitTokens> {
  if (!FITBIT_CLIENT_ID || !FITBIT_CLIENT_SECRET) throw new Error("Fitbit sync is not configured");
  const res = await fetch("https://api.fitbit.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: fitbitBasicAuthHeader() },
    body: new URLSearchParams({
      client_id: FITBIT_CLIENT_ID,
      grant_type: "authorization_code",
      redirect_uri: FITBIT_REDIRECT_URI,
      code,
    }),
  });
  return parseFitbitTokenResponse(res, "token exchange");
}

/** Refreshes an expired/expiring Fitbit access token (see lib/fitbit-sync.ts) — Fitbit
 *  rotates the refresh token on every use, so the caller must persist the new one too. */
export async function refreshFitbitToken(refreshToken: string): Promise<FitbitTokens> {
  if (!FITBIT_CLIENT_ID || !FITBIT_CLIENT_SECRET) throw new Error("Fitbit sync is not configured");
  const res = await fetch("https://api.fitbit.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: fitbitBasicAuthHeader() },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
  });
  return parseFitbitTokenResponse(res, "token refresh");
}

/** Best-effort revoke on disconnect — Fitbit still works fine for the reader if this call
 *  fails (network hiccup, already-expired token), so the caller (app/actions/
 *  fitness-connections.ts) deletes the local FitnessConnection row regardless of the
 *  result rather than blocking disconnect on it. */
export async function revokeFitbitToken(accessToken: string): Promise<void> {
  if (!FITBIT_CLIENT_ID || !FITBIT_CLIENT_SECRET) return;
  await fetch("https://api.fitbit.com/oauth2/revoke", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: fitbitBasicAuthHeader() },
    body: new URLSearchParams({ token: accessToken }),
  }).catch(() => {});
}
