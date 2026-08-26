"use server";

import { getCurrentUser } from "@/lib/session";
import { getResearchFeedArticles } from "@/lib/dashboard-research";
import { prisma } from "@/lib/db";
import type { Article } from "@/lib/types";

/** Sits next to clinician-dashboard.ts rather than inside it — the Part 5 spec named that
 *  file's exports exhaustively, and this wraps a Part 4 read (lib/dashboard-research.ts),
 *  not a dashboard mutation. Same "never trust a client-supplied id" rule as every action in
 *  clinician-dashboard.ts: patientId is only ever used to look up a patient this session's
 *  own user owns, never passed through to identify anyone else's record.
 *
 *  Called from the client dashboard orchestrator whenever the selected patient changes, to
 *  flip the right-column research feed between "clinician specialty" mode (no patientId) and
 *  "patient body region + condition" mode (patientId given) — see components/pro/dashboard/
 *  ClinicianDashboard.tsx. */
export async function getDashboardResearchFeedAction(patientId?: string | null): Promise<Article[]> {
  const user = await getCurrentUser();
  if (!user || !user.isPro) return [];

  if (patientId) {
    const patient = await prisma.clinicalPatient.findUnique({
      where: { id: patientId },
      select: { userId: true, specialty: true, bodyRegion: true, condition: true },
    });
    if (patient && patient.userId === user.id) {
      return getResearchFeedArticles(patient.specialty, patient.bodyRegion, patient.condition);
    }
  }

  return getResearchFeedArticles(user.specialty);
}
