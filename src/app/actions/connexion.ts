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
  message?: string;
}

export interface SubmitVisitRequestResult {
  ok: boolean;
  error?: string;
}

/** ConnexionScheduleSection's "Request Your Visit" submit — the scheduling form embedded on
 *  /connexion, /connexion/safety-score, and /connexion/bettie. Only name/phone/email are
 *  required; preferredDate/preferredTime/message are all optional, matching the form itself. */
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
      message: input.message?.trim() || null,
    },
  });

  revalidatePath("/connexion");
  revalidatePath("/connexion/safety-score");
  revalidatePath("/connexion/bettie");
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
