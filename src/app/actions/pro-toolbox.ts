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

/** LimbicPRO CE Hours Tracker (/pro/ce-tracker) — same "raw rows, derive totals on read"
 *  shape as app/actions/metrics.ts saveMetricLog. */
export async function addCELog(input: AddCELogInput) {
  const user = await getCurrentUser();
  if (!user || !user.isPro) return;
  const courseName = input.courseName.trim();
  if (!courseName || !Number.isFinite(input.hours) || input.hours <= 0 || !input.completedAt) return;

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
}

export async function deleteCELog(id: string) {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.cELog.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/pro/ce-tracker");
}

export interface CEPreferencesInput {
  ceState: string;
  ceLicenseExpiry: string;
  ceRenewalCycle: number;
  ceTotalRequired: number;
}

export async function updateCEPreferences(input: CEPreferencesInput) {
  const user = await getCurrentUser();
  if (!user || !user.isPro) return;

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
}
