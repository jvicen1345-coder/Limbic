"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isSiteAdmin } from "@/lib/admin";
import { CONNEXION_CONSENT_TEXT } from "@/lib/connexion-consent";

export interface SubmitVisitRequestInput {
  name: string;
  phone: string;
  email: string;
  preferredDate?: string;
  preferredTime?: string;
  visitReason?: string;
  /** The consent checkbox on the form. Required — see the check in submitVisitRequest. */
  consentAccepted: boolean;
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

  // Checked server-side, not just by the checkbox's own `required` attribute — this action
  // is its own callable endpoint. Checked before the row is written so a request is never
  // stored without the consent that makes collecting it lawful (see lib/connexion-consent.ts
  // for why this form has a consent gate when the rest of the app's forms don't).
  if (!input.consentAccepted) {
    return { ok: false, error: "Please agree to the consent statement before submitting." };
  }

  await prisma.connexionVisitRequest.create({
    data: {
      name,
      phone,
      email,
      preferredDate: input.preferredDate ? new Date(`${input.preferredDate}T00:00:00`) : null,
      preferredTime: input.preferredTime || null,
      visitReason: input.visitReason || null,
      // The wording as shown, not a bare flag — see CONNEXION_CONSENT_TEXT.
      consentAt: new Date(),
      consentText: CONNEXION_CONSENT_TEXT,
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
