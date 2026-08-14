"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isSiteAdmin } from "@/lib/admin";

export interface SubmitVisitRequestInput {
  name: string;
  phone: string;
  email: string;
  preferredDate?: string;
  preferredTime?: string;
  visitReason?: string;
}

export interface SubmitVisitRequestResult {
  ok: boolean;
  error?: string;
}

/** ConnexionScheduleSection's "Request Your Visit" submit — the scheduling form embedded on
 *  /connexion and /connexion/delia (/connexion/afit and /connexion/safety-score only link
 *  out to /connexion's copy of the form, neither embeds its own). Only name/phone/email are
 *  required; preferredDate/preferredTime/visitReason are all optional, matching the form itself. */
export async function submitVisitRequest(input: SubmitVisitRequestInput): Promise<SubmitVisitRequestResult> {
  const name = input.name.trim();
  const phone = input.phone.trim();
  const email = input.email.trim();

  if (!name || !phone || !email) {
    return { ok: false, error: "Name, phone, and email are required." };
  }

  await prisma.connexionVisitRequest.create({
    data: {
      name,
      phone,
      email,
      preferredDate: input.preferredDate ? new Date(`${input.preferredDate}T00:00:00`) : null,
      preferredTime: input.preferredTime || null,
      visitReason: input.visitReason || null,
    },
  });

  revalidatePath("/connexion");
  revalidatePath("/connexion/delia");
  revalidatePath("/admin/connexion-visits");
  return { ok: true };
}

const VISIT_STATUSES = ["new", "contacted", "scheduled", "completed"] as const;
export type ConnexionVisitStatus = (typeof VISIT_STATUSES)[number];

export interface AdminActionResult {
  ok: boolean;
  error?: string;
}

/** Admin-only status update for /admin/connexion-visits' per-row dropdown — same
 *  isSiteAdmin() gate and AdminActionResult shape as verifyLicenseAction/rejectLicenseAction
 *  in app/actions/license.ts. */
export async function updateVisitRequestStatusAction(id: string, status: ConnexionVisitStatus): Promise<AdminActionResult> {
  if (!(await isSiteAdmin())) return { ok: false, error: "Not authorized." };
  if (!VISIT_STATUSES.includes(status)) return { ok: false, error: "Invalid status." };

  await prisma.connexionVisitRequest.update({ where: { id }, data: { status } });
  revalidatePath("/admin/connexion-visits");
  return { ok: true };
}
