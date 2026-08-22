"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// Same cap as MAX_CERTIFICATE_FILE_BYTES in lib/media-upload.ts, just measured after
// base64 encoding (roughly a third larger than the raw file) since that's the string this
// function actually receives — a backstop against a caller that bypasses the client-side
// check, same reasoning as MAX_IMAGE_DATA_URL_LENGTH in app/actions/nexus.ts.
const MAX_CERTIFICATE_DATA_URL_LENGTH = 2_700_000;

export interface AddCELogInput {
  courseName: string;
  provider?: string;
  completedAt: string;
  hours: number;
  category: string;
  /** A data URL from readCertificateFileToDataUrl (lib/media-upload.ts) — image or PDF. */
  certificateDataUrl?: string;
}

export interface ProToolboxActionResult {
  ok: boolean;
  error?: string;
}

/** LimbicPRO CE Hours Tracker (/pro/ce-tracker) — same "raw rows, derive totals on read"
 *  shape as app/actions/metrics.ts saveMetricLog. Re-checks isPro itself rather than
 *  trusting the page that rendered the form, since a Server Action is its own callable
 *  endpoint. */
export async function addCELog(input: AddCELogInput): Promise<ProToolboxActionResult> {
  const user = await getCurrentUser();
  if (!user || !user.isPro) return { ok: false, error: "Not authorized." };
  const courseName = input.courseName.trim();
  if (!courseName || !Number.isFinite(input.hours) || input.hours <= 0 || !input.completedAt) {
    return { ok: false, error: "A course name, valid hours, and completion date are required." };
  }

  const certificate = input.certificateDataUrl;
  const validCertificate =
    !!certificate &&
    (certificate.startsWith("data:image/") || certificate.startsWith("data:application/pdf")) &&
    certificate.length <= MAX_CERTIFICATE_DATA_URL_LENGTH;

  await prisma.cELog.create({
    data: {
      userId: user.id,
      courseName,
      provider: input.provider?.trim() || null,
      completedAt: new Date(`${input.completedAt}T00:00:00`),
      hours: input.hours,
      category: input.category,
      certificateDataUrl: validCertificate ? certificate : null,
    },
  });
  revalidatePath("/pro/ce-tracker");
  return { ok: true };
}

/** Confirms the log entry belongs to the signed-in user before deleting it — explicit
 *  fetch-then-compare, same pattern as deleteHepAction/deleteHepTemplateAction in
 *  app/actions/hep.ts, rather than relying solely on the delete's own userId-scoped where
 *  clause, so an entry that doesn't exist or belongs to someone else returns a real error
 *  result instead of a silent no-op. */
export async function deleteCELog(id: string): Promise<ProToolboxActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not authorized." };

  const log = await prisma.cELog.findUnique({ where: { id }, select: { userId: true } });
  if (!log || log.userId !== user.id) return { ok: false, error: "Not authorized." };

  await prisma.cELog.delete({ where: { id } });
  revalidatePath("/pro/ce-tracker");
  return { ok: true };
}

export interface CEPreferencesInput {
  ceState: string;
  ceLicenseExpiry: string;
  ceRenewalCycle: number;
  ceTotalRequired: number;
}

export async function updateCEPreferences(input: CEPreferencesInput): Promise<ProToolboxActionResult> {
  const user = await getCurrentUser();
  if (!user || !user.isPro) return { ok: false, error: "Not authorized." };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      ceState: input.ceState || null,
      ceLicenseExpiry: input.ceLicenseExpiry ? new Date(`${input.ceLicenseExpiry}T00:00:00`) : null,
      ceRenewalCycle: Number.isFinite(input.ceRenewalCycle) && input.ceRenewalCycle > 0 ? input.ceRenewalCycle : null,
      ceTotalRequired: Number.isFinite(input.ceTotalRequired) && input.ceTotalRequired > 0 ? input.ceTotalRequired : null,
    },
  });
  revalidatePath("/pro/ce-tracker");
  return { ok: true };
}
