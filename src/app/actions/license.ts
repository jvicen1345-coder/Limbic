"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isSiteAdmin } from "@/lib/admin";
import { US_STATES } from "@/lib/us-states";

export interface SubmitLicenseVerificationResult {
  ok: boolean;
  error?: string;
}

/** Submits the Add License modal's Step 4 attestation (see components/AddLicenseModal.tsx)
 *  — sets licenseStatus to "pending" for an admin to review in the License Verification
 *  Queue (see app/(app)/admin/licenses/page.tsx, verifyLicenseAction/rejectLicenseAction
 *  below). Runtime-validates every field itself rather than trusting the client sent a
 *  complete submission, same reasoning as updateProfileFieldAction's field whitelist in
 *  app/actions/profile.ts. */
export async function submitLicenseVerification(input: {
  state: string;
  licenseNumber: string;
  licenseFullName: string;
  attestationConfirmed: boolean;
}): Promise<SubmitLicenseVerificationResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const state = input.state.trim();
  const licenseNumber = input.licenseNumber.trim();
  const licenseFullName = input.licenseFullName.trim();

  if (!(US_STATES as readonly string[]).includes(state) || !licenseNumber || !licenseFullName || !input.attestationConfirmed) {
    return { ok: false, error: "Please complete every step and confirm the attestation before submitting." };
  }

  // licenseNumber is @unique — a different account may already have claimed it (a typo, or
  // someone re-entering someone else's number), so this can't just be a blind update.
  const existing = await prisma.user.findUnique({ where: { licenseNumber } });
  if (existing && existing.id !== user.id) {
    return { ok: false, error: "This license number is already associated with another account." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      licenseState: state,
      licenseNumber,
      licenseFullName,
      licenseAttestation: true,
      licenseStatus: "pending",
      licenseSubmittedAt: new Date(),
    },
  });

  revalidatePath("/profile");
  return { ok: true };
}

interface AdminActionResult {
  ok: boolean;
  error?: string;
}

/** Approves a pending submission (see components/LicenseVerificationQueue.tsx) — admin-only,
 *  same isSiteAdmin() gate as every other admin surface (Suggestions, Founding Funders'
 *  claim panel). */
export async function verifyLicenseAction(userId: string): Promise<AdminActionResult> {
  if (!(await isSiteAdmin())) return { ok: false, error: "Not authorized." };

  await prisma.user.update({
    where: { id: userId },
    data: { licenseStatus: "verified", licenseVerifiedAt: new Date() },
  });

  // TODO: send a "Your Limbic credentials have been verified" email once an email-sending
  // utility exists in this codebase — grepped for nodemailer/resend/sendgrid/postmark/SES/
  // etc. and found none, so this is a no-op for now per the spec's own fallback. Subject:
  // "Your Limbic credentials have been verified." Body: the reader's name, license state,
  // masked license number (see lib/license-verification.ts maskLicenseNumber), and a note
  // that PRO features are now available.

  revalidatePath("/admin/licenses");
  revalidatePath("/profile");
  return { ok: true };
}

/** Rejecting clears the submitted verification fields (not licenseEmail/licenseExpiration,
 *  which belong to the separate legacy license-sign-in/CE-tracking fields this flow doesn't
 *  touch) so the reader can resubmit through the Add License modal from scratch — the
 *  Professional Credentials card falls back to its "no license submitted" state whenever
 *  licenseNumber is empty, licenseStatus "rejected" or not, so this alone is enough to
 *  reopen that path. */
export async function rejectLicenseAction(userId: string): Promise<AdminActionResult> {
  if (!(await isSiteAdmin())) return { ok: false, error: "Not authorized." };

  await prisma.user.update({
    where: { id: userId },
    data: {
      licenseStatus: "rejected",
      licenseNumber: null,
      licenseState: null,
      licenseFullName: null,
      licenseAttestation: false,
    },
  });

  revalidatePath("/admin/licenses");
  revalidatePath("/profile");
  return { ok: true };
}
