import { NextRequest, NextResponse } from "next/server";
import { checkMigrationReminders } from "@/lib/migration-reminder";

/**
 * Runs checkMigrationReminders() (see lib/migration-reminder.ts) on a schedule — see the
 * "crons" entry in vercel.json, which hits this daily. Vercel Cron sends its own
 * `Authorization: Bearer <CRON_SECRET>` header on every invocation, so this checks that
 * rather than the human-admin allowlist lib/admin.ts uses elsewhere — a scheduled job has
 * no signed-in user to check. Without CRON_SECRET set, the route stays disabled (503)
 * rather than running unauthenticated.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 503 });

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const remindersSent = await checkMigrationReminders();
  return NextResponse.json({ ok: true, remindersSent });
}
