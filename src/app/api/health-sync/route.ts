import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyHealthSyncToken } from "@/lib/health-sync";
import { VITALS_CATEGORIES, type VitalsCategory } from "@/lib/vitals";

function isVitalsCategory(value: unknown): value is VitalsCategory {
  return typeof value === "string" && (VITALS_CATEGORIES as readonly string[]).includes(value);
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface IncomingEntry {
  category: VitalsCategory;
  minutes: number;
  activity: string;
  notes: string | null;
}

/** Parses and validates one entry from the request body, or returns null to skip it
 *  silently — an Apple Shortcut can't surface a per-entry validation error to the reader
 *  mid-automation, so a malformed entry is dropped rather than failing the whole sync. */
function parseEntry(raw: unknown): IncomingEntry | null {
  if (typeof raw !== "object" || raw === null) return null;
  const { category, minutes, activity, notes } = raw as Record<string, unknown>;
  if (!isVitalsCategory(category)) return null;
  if (typeof minutes !== "number" || !Number.isFinite(minutes) || minutes < 1 || minutes > 1440) return null;
  const activityName = typeof activity === "string" ? activity.trim().slice(0, 100) : "";
  if (!activityName) return null;
  const noteText = typeof notes === "string" ? notes.trim().slice(0, 300) : null;
  return { category, minutes: Math.round(minutes), activity: activityName, notes: noteText || null };
}

/** Sync endpoint for the Apple Health Shortcut set up on /wellness/activity (see
 *  components/vitals/AppleHealthSyncCard.tsx) — authenticated by a per-user bearer key
 *  (lib/health-sync.ts) instead of the normal cookie session, since the caller is an
 *  automation running on the reader's phone, not a browser tab signed in to Limbic.
 *
 *  Body: { date: "YYYY-MM-DD", entries: [{ category, minutes, activity, notes? }, ...] }
 *  Each entry replaces (not adds to) any existing apple_health-sourced row for that same
 *  userId/date/category, so re-running the Shortcut for a day already synced doesn't
 *  double-count minutes — see the `source` column note on VitalsLog in schema.prisma. */
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const rawToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!rawToken) return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });

  const userId = await verifyHealthSyncToken(rawToken);
  if (!userId) return NextResponse.json({ error: "Invalid sync key" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { date, entries } = body as Record<string, unknown>;
  if (typeof date !== "string" || !DATE_RE.test(date)) {
    return NextResponse.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
  }
  const dayDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(dayDate.getTime())) {
    return NextResponse.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
  }
  // A day of leeway past "today" absorbs the sender's local timezone being ahead of the
  // server's, without opening the door to arbitrary future-dated entries.
  if (dayDate.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
    return NextResponse.json({ error: "date is too far in the future" }, { status: 400 });
  }
  if (!Array.isArray(entries) || entries.length === 0 || entries.length > 20) {
    return NextResponse.json({ error: "entries must be a non-empty array of up to 20 items" }, { status: 400 });
  }

  const parsed = entries.map(parseEntry).filter((e): e is IncomingEntry => e !== null);

  let synced = 0;
  for (const entry of parsed) {
    const existing = await prisma.vitalsLog.findFirst({
      where: { userId, date: dayDate, category: entry.category, source: "apple_health" },
    });
    if (existing) {
      await prisma.vitalsLog.update({
        where: { id: existing.id },
        data: { minutes: entry.minutes, activity: entry.activity, notes: entry.notes },
      });
    } else {
      await prisma.vitalsLog.create({
        data: {
          userId,
          date: dayDate,
          category: entry.category,
          minutes: entry.minutes,
          activity: entry.activity,
          notes: entry.notes,
          source: "apple_health",
        },
      });
    }
    synced += 1;
  }

  return NextResponse.json({ ok: true, synced, skipped: entries.length - parsed.length });
}
