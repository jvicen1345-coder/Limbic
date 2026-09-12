import "server-only";
import { getCurrentUser, isAdminEmail, adminAreasForUser } from "@/lib/session";
import type { AdminArea } from "@/lib/admin-areas";

/** Whether the signed-in reader is an OWNER admin — on the FOUNDING_FUNDERS_ADMIN_EMAILS
 *  allowlist (see lib/session.ts isAdminEmail for the actual list/matching logic — kept
 *  there, not here, so getCurrentUser() can check it without an import cycle back into this
 *  file). Owners hold every admin area, always, and are the only accounts that can hand an
 *  area to someone else (see grantAdminAreaAction in app/actions/admin.ts): co-admin access
 *  is data, and the ability to edit that data has to stay with an identity the app's own
 *  data can't grant, or a delegated admin could quietly promote themselves.
 *
 *  Every other paid/gated feature in the app (isPro/studentTier/isWellnessPlus/student-only
 *  areas) also opens up for these accounts — see the overlay in lib/session.ts
 *  getCurrentUser() and hasStudentAccess. Co-admins get none of that; theirs is strictly
 *  the behind-the-scenes tooling they've been granted.
 *
 *  Gate an admin PAGE OR ACTION with hasAdminArea() below, not with this — this is for the
 *  narrower "may this person change who is an admin" question, plus the handful of places
 *  that show an owner something a co-admin shouldn't see. Leave
 *  FOUNDING_FUNDERS_ADMIN_EMAILS unset (see .env.example) and there are no owners, so no
 *  co-admin can be appointed and every admin surface stays closed. */
export async function isSiteAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return isAdminEmail(user.email) || isAdminEmail(user.licenseEmail);
}

/** Every admin area the signed-in reader can open — all of them for an owner, the delegated
 *  subset for a co-admin, and none for everyone else (including signed-out visitors). */
export async function currentAdminAreas(): Promise<AdminArea[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  return adminAreasForUser(user);
}

/** The gate every admin page and every admin server action uses: does the signed-in reader
 *  hold this one area? True for owners on every area.
 *
 *  Pages call it to redirect, actions call it to refuse, and both call it themselves rather
 *  than trusting the other — a page-level check only decides what renders, and a server
 *  action is reachable without ever loading its page. That was already the rule for
 *  isSiteAdmin() (see the note atop app/actions/copyright.ts); splitting admin into areas
 *  makes it matter more, since now a real admin can be signed in and still be the wrong
 *  admin for this particular action. */
export async function hasAdminArea(area: AdminArea): Promise<boolean> {
  return (await currentAdminAreas()).includes(area);
}

/** Whether the reader holds any admin area at all — for the places that ask "is there an
 *  admin surface for this person" rather than "may they do this specific thing," like
 *  whether to render the Admin section in the sidebar at all. Never use it as an
 *  authorization check; hasAdminArea() is the one that decides. */
export async function isAnyAdmin(): Promise<boolean> {
  return (await currentAdminAreas()).length > 0;
}
