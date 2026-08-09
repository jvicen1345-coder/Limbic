import "server-only";
import { getCurrentUser, isAdminEmail } from "@/lib/session";

/** Whether the signed-in reader is on the FOUNDING_FUNDERS_ADMIN_EMAILS allowlist (see
 *  lib/session.ts isAdminEmail for the actual list/matching logic — kept there, not here,
 *  so getCurrentUser() can check it without an import cycle back into this file). Gates
 *  admin-only surfaces like the Founding Funders manual claim panel
 *  (app/actions/founding-funders.ts) and the "wipe all users" tool (app/actions/admin.ts).
 *  Every other gated feature in the app (isPro/studentTier/isWellnessPlus/student-only
 *  areas) also opens up for these accounts — see the overlay in lib/session.ts
 *  getCurrentUser() and hasStudentAccess — so this function is specifically for the
 *  narrower "admin tooling" surfaces, not a general "does this account have full access"
 *  check (nothing needs that phrased as its own question; every existing feature check
 *  already answers it correctly on its own). Leave FOUNDING_FUNDERS_ADMIN_EMAILS unset
 *  (see .env.example) to disable every admin surface. */
export async function isSiteAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return isAdminEmail(user.email) || isAdminEmail(user.licenseEmail);
}
