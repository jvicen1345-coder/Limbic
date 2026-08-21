"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isSiteAdmin } from "@/lib/admin";
import { US_STATES } from "@/lib/us-states";
import { maskLicenseNumber } from "@/lib/license-verification";
import { emailEnabled, sendLicenseVerifiedEmail } from "@/lib/email";

export interface SubmitLicenseVerificationResult {
  ok: boolean;
  error?: string;
}

/** Keeps User.licenseNumber/licenseState (the "primary license," still read directly by
 *  hasLicenseAccess, CE tracking's buildLicenseView, and the founding-funders admin lookup)
 *  in sync with the reader's best License row, so none of those other features needed to
 *  change when a reader could hold more than one — see License in schema.prisma. Preference
 *  order: most recently verified, else most recently submitted pending, else null (e.g. a
 *  reader whose only license was rejected). Called after every create/update to this
 *  reader's License rows. */
async function syncPrimaryLicenseFields(userId: string): Promise<void> {
  const verified = await prisma.license.findFirst({ where: { userId, status: "verified" }, orderBy: { verifiedAt: "desc" } });
  const primary = verified ?? (await prisma.license.findFirst({ where: { userId, status: "pending" }, orderBy: { submittedAt: "desc" } }));
  await prisma.user.update({
    where: { id: userId },
    data: { licenseNumber: primary?.licenseNumber ?? null, licenseState: primary?.state ?? null },
  });
}

/** Submits the Add License modal's Step 4 attestation (see components/AddLicenseModal.tsx)
 *  for one state at a time — a reader can hold licenses in more than one state (a License
 *  row each), but never two active ones in the same state, enforced by License's
 *  @@unique([userId, state]) alongside the explicit check below (which produces a friendlier
 *  error message than a raw constraint violation). A state whose only License row was
 *  "rejected" is resubmittable: this updates that row in place rather than being blocked by
 *  it, so the reader doesn't need an admin to clear it first. Runtime-validates every field
 *  itself rather than trusting the client sent a complete submission, same reasoning as
 *  updateProfileFieldAction's field whitelist in app/actions/profile.ts. */
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

  // licenseNumber is @unique across every reader's License rows, not just this reader's own
  // — a different account may already have claimed it (a typo, or someone re-entering
  // someone else's number).
  const existingNumber = await prisma.license.findUnique({ where: { licenseNumber } });
  if (existingNumber && existingNumber.userId !== user.id) {
    return { ok: false, error: "This license number is already associated with another account." };
  }

  const existingForState = await prisma.license.findUnique({ where: { userId_state: { userId: user.id, state } } });
  if (existingForState && existingForState.status !== "rejected") {
    return { ok: false, error: `You already have a ${existingForState.status} license on file for ${state}.` };
  }

  if (existingForState) {
    await prisma.license.update({
      where: { id: existingForState.id },
      data: { licenseNumber, fullName: licenseFullName, attestation: true, status: "pending", submittedAt: new Date(), verifiedAt: null },
    });
  } else {
    await prisma.license.create({
      data: { userId: user.id, state, licenseNumber, fullName: licenseFullName, attestation: true, status: "pending" },
    });
  }

  await syncPrimaryLicenseFields(user.id);
  revalidatePath("/profile/credentials");
  return { ok: true };
}

interface AdminActionResult {
  ok: boolean;
  error?: string;
}

/** Approves a pending submission (see components/LicenseVerificationQueue.tsx) — admin-only,
 *  same isSiteAdmin() gate as every other admin surface (Suggestions, Founding Funders'
 *  claim panel). Takes a License id now, not a userId, since one reader can have more than
 *  one pending row to review individually. */
export async function verifyLicenseAction(licenseId: string): Promise<AdminActionResult> {
  if (!(await isSiteAdmin())) return { ok: false, error: "Not authorized." };

  const license = await prisma.license.update({
    where: { id: licenseId },
    data: { status: "verified", verifiedAt: new Date() },
    include: { user: true },
  });
  await syncPrimaryLicenseFields(license.userId);

  const sendTo = license.user.email ?? license.user.backupEmail;
  if (sendTo) {
    if (emailEnabled()) {
      await sendLicenseVerifiedEmail(sendTo, license.user.name, license.state, maskLicenseNumber(license.licenseNumber));
    } else {
      // No RESEND_API_KEY configured — logged instead of silently dropped, same
      // graceful-degradation pattern as requestPasswordResetAction in app/actions/auth.ts.
      console.error(`[license] Verified email not sent (RESEND_API_KEY unset?) — recipient would have been ${sendTo}`);
    }
  }

  revalidatePath("/admin/licenses");
  revalidatePath("/profile/credentials");
  return { ok: true };
}

/** Rejecting leaves the License row in place (marked "rejected") rather than deleting it, so
 *  there's a record of what was submitted — the Professional Credentials card shows it as
 *  rejected with a chance to resubmit for that same state (see submitLicenseVerification's
 *  "existingForState.status !== rejected" check), instead of the old single-license
 *  behavior of wiping the fields back to blank. Takes a License id, same reasoning as
 *  verifyLicenseAction above. */
export async function rejectLicenseAction(licenseId: string): Promise<AdminActionResult> {
  if (!(await isSiteAdmin())) return { ok: false, error: "Not authorized." };

  const license = await prisma.license.update({
    where: { id: licenseId },
    data: { status: "rejected", verifiedAt: null },
  });
  await syncPrimaryLicenseFields(license.userId);

  revalidatePath("/admin/licenses");
  revalidatePath("/profile/credentials");
  return { ok: true };
}
