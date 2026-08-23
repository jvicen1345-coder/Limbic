"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { upsertSyncedVitalsLog } from "@/lib/fitness-sync";
import { parseAppleHealthExportZip, AppleHealthImportError, MAX_ZIP_BYTES } from "@/lib/apple-health-import";

export interface ImportResult {
  ok: boolean;
  error?: string;
  daysImported?: number;
}

/** Handles the "Upload your Health export" card (see
 *  components/vitals/AppleHealthUploadCard.tsx) — the zero-technical-concept alternative
 *  to the Shortcut sync (app/api/health-sync/route.ts) or a Fitbit/Strava OAuth connection:
 *  export a file from the Health app, upload it here, done. One-time per upload, not an
 *  ongoing sync — re-uploading a newer export just re-runs the same
 *  upsertSyncedVitalsLog("apple_health", ...) idempotency every other sync path shares, so
 *  it safely overlaps with an existing Shortcut sync's rows instead of duplicating them. */
export async function importAppleHealthExportAction(formData: FormData): Promise<ImportResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file received" };
  if (file.size === 0) return { ok: false, error: "That file is empty" };
  if (file.size > MAX_ZIP_BYTES) {
    return { ok: false, error: `That file is larger than ${Math.round(MAX_ZIP_BYTES / (1024 * 1024))} MB — try the Shortcut sync instead for full history.` };
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch {
    return { ok: false, error: "Couldn't read that file" };
  }

  try {
    const entries = parseAppleHealthExportZip(buffer);
    if (entries.length === 0) {
      return { ok: false, error: "No workouts or mindful sessions found in that export" };
    }
    for (const entry of entries) {
      await upsertSyncedVitalsLog(user.id, "apple_health", entry);
    }
    revalidatePath("/wellness/activity");
    const days = new Set(entries.map((e) => e.date)).size;
    return { ok: true, daysImported: days };
  } catch (err) {
    if (err instanceof AppleHealthImportError) return { ok: false, error: err.message };
    console.error("[fitness-import] unexpected failure", err);
    return { ok: false, error: "Something went wrong reading that file" };
  }
}
