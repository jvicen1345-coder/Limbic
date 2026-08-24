import "server-only";
import { prisma } from "@/lib/db";
import { getValidGoogleHealthAccessToken } from "@/lib/fitbit-sync";
import { todayLocalDateStr } from "@/lib/today";

const SYNC_WINDOW_DAYS = 3;

/** Google Health API's `mindfulness` scope (see lib/google-health-oauth.ts) doesn't expose
 *  meditation/session-duration data at all — the "minutes meditated" concept most wearables
 *  track lives on a different, unrelated Google product (Android's on-device Health Connect
 *  API, not this cloud REST API Limbic connects to). The one thing this scope actually
 *  exposes is `moods`, a subjective mood log — a genuinely different feature, which is why
 *  manual entry (see saveMoodLogAction in app/actions/mood.ts) is the primary, reliable path
 *  and this sync is a best-effort bonus on top of it.
 *
 *  Google's exact value schema for a mood sample isn't documented anywhere available while
 *  building this (unlike weight/heart-rate/etc, which have a confirmed reference page), so
 *  this only attempts the single most plausible shape — a numeric `moodLevel` field, the
 *  same "one scalar reading" pattern every other confirmed Sample dataType uses (body-fat's
 *  `percentage`, heart-rate's `beatsPerMinute`, ...) — gated behind a strict 1-5 range check.
 *  A point that doesn't match logs its raw JSON and is skipped, never written: if this
 *  guess is wrong, the fix is to read that logged payload and correct the field name here,
 *  same one-pass approach that resolved the original exercise sync's ACCOUNT_NOT_LINKED
 *  issue — not something to pre-guess further without seeing a real response. */
interface MoodDataPoint {
  mood?: {
    sampleTime?: { physicalTime?: string };
    moodLevel?: number;
  };
}

function isTodayLocal(isoTime: string | undefined): boolean {
  if (!isoTime) return false;
  const ms = Date.parse(isoTime);
  if (!Number.isFinite(ms)) return false;
  const d = new Date(ms);
  const local = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return local === todayLocalDateStr();
}

/** Best-effort sync of today's mood from a connected Google Health account — never
 *  overwrites a manual entry for today (see MoodLog.source's precedence rule in
 *  prisma/schema.prisma): a reader's own subjective self-report is more trustworthy than a
 *  guessed field mapping. Only ever writes when no row exists yet for today, or the existing
 *  row's own source is "google_health" (a previous sync, safe to refresh). Requires the
 *  mindfulness.readonly scope. */
export async function syncGoogleHealthMoodForUser(userId: string): Promise<{ synced: number } | { error: string }> {
  const connection = await prisma.fitnessConnection.findUnique({ where: { userId_provider: { userId, provider: "fitbit" } } });
  if (!connection) return { error: "Google Health is not connected" };

  const today = todayLocalDateStr();
  const existing = await prisma.moodLog.findUnique({ where: { userId_date: { userId, date: new Date(`${today}T00:00:00`) } } });
  if (existing && existing.source === "manual") return { synced: 0 };

  let accessToken: string;
  try {
    accessToken = await getValidGoogleHealthAccessToken(connection);
  } catch (err) {
    console.error("[mood-sync] token refresh failed", err);
    return { error: "Google Health connection expired, reconnect it" };
  }

  const res = await fetch(`https://health.googleapis.com/v4/users/me/dataTypes/moods/dataPoints?pageSize=50`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[mood-sync] moods fetch failed (${res.status}): ${body.slice(0, 300)}`);
    return { error: "Could not reach Google Health" };
  }
  const data = (await res.json()) as { dataPoints?: MoodDataPoint[] };
  const cutoff = Date.now() - SYNC_WINDOW_DAYS * 86400000;

  let todaysMood: number | null = null;
  for (const point of data.dataPoints ?? []) {
    const time = point.mood?.sampleTime?.physicalTime;
    const ms = time ? Date.parse(time) : NaN;
    if (!Number.isFinite(ms) || ms < cutoff) continue;
    if (!isTodayLocal(time)) continue;

    const level = point.mood?.moodLevel;
    if (typeof level !== "number" || !Number.isFinite(level) || level < 1 || level > 5) {
      console.error(`[mood-sync] unrecognized mood data point shape, skipping: ${JSON.stringify(point).slice(0, 500)}`);
      continue;
    }
    todaysMood = Math.round(level);
  }

  if (todaysMood == null) return { synced: 0 };

  await prisma.moodLog.upsert({
    where: { userId_date: { userId, date: new Date(`${today}T00:00:00`) } },
    create: { userId, date: new Date(`${today}T00:00:00`), mood: todaysMood, source: "google_health" },
    update: { mood: todaysMood, source: "google_health" },
  });
  return { synced: 1 };
}
