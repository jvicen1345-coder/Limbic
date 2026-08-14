"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export interface AddCELogInput {
  courseName: string;
  provider?: string;
  completedAt: string;
  hours: number;
  category: string;
}

/** LimbicPRO CE Hours Tracker (/pro/ce-tracker) — same "raw rows, derive totals on read"
 *  shape as app/actions/metrics.ts saveMetricLog. */
export async function addCELog(input: AddCELogInput) {
  const user = await getCurrentUser();
  if (!user || !user.isPro) return;
  const courseName = input.courseName.trim();
  if (!courseName || !Number.isFinite(input.hours) || input.hours <= 0 || !input.completedAt) return;

  await prisma.cELog.create({
    data: {
      userId: user.id,
      courseName,
      provider: input.provider?.trim() || null,
      completedAt: new Date(`${input.completedAt}T00:00:00`),
      hours: input.hours,
      category: input.category,
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
