"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isMetricsLogMetric } from "@/lib/metrics";

/** Shared by every calculator's "Save to my metrics" button and every assessment's "Log
 *  your score" button (see app/(app)/wellness/metrics/page.tsx and
 *  app/(app)/wellness/assess/page.tsx) — one row per save, same "raw rows, derive views on
 *  read" shape as app/actions/vitals.ts logVitalsActivity. */
export async function saveMetricLog(metric: string, value: number, notes?: string) {
  const user = await getCurrentUser();
  if (!user || !isMetricsLogMetric(metric) || !Number.isFinite(value)) return;

  await prisma.metricsLog.create({
    data: {
      userId: user.id,
      metric,
      value,
      notes: notes?.trim() || null,
    },
  });
  revalidatePath("/wellness/metrics");
  revalidatePath("/wellness/assess");
  revalidatePath("/wellness");
}

export async function deleteMetricLog(id: string) {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.metricsLog.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/wellness/metrics");
  revalidatePath("/wellness/assess");
}
