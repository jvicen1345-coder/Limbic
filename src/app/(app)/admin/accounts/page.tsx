import { redirect } from "next/navigation";
import { hasAdminArea, isSiteAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { compedAreas, isAdminEmail } from "@/lib/session";
import { parseAdminAreas } from "@/lib/admin-areas";
import { AccountsAdminTable } from "@/components/AccountsAdminTable";

/** The Accounts area — every account, with a delete button per row (see
 *  AccountsAdminTable.tsx, deleteUserAction in app/actions/admin.ts). Same "must hold this
 *  area" redirect idiom as /admin/suggestions, /admin/licenses, /admin/connexion-visits.
 *
 *  Also where co-admins are appointed and un-appointed (the Co-Admin column), which is why
 *  this page asks two separate questions rather than one: holding the Accounts area is what
 *  gets you in, and being an allowlist owner is what lets you change who else is an admin. */
export default async function AdminAccountsPage() {
  if (!(await hasAdminArea("accounts"))) redirect("/home");
  // Co-admin access is the one thing on this page an Accounts co-admin can look at but not
  // change — only an allowlist owner can appoint or remove one (see the note above
  // grantAdminAreaAction in app/actions/admin.ts). The chips render read-only below when
  // this is false; the server actions refuse either way, this just stops the page from
  // offering a control that would only ever fail.
  const canManageAdmins = await isSiteAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      licenseEmail: true,
      licenseNumber: true,
      isGuest: true,
      adminAreas: true,
      passwordHash: true,
      googleId: true,
      isPro: true,
      compedAccess: true,
      createdAt: true,
      lastVisitedAt: true,
      foundingFunder: { select: { paymentStatus: true } },
    },
  });

  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    licenseEmail: u.licenseEmail,
    licenseNumber: u.licenseNumber,
    isGuest: u.isGuest,
    hasPassword: u.passwordHash != null,
    hasGoogle: u.googleId != null,
    isPro: u.isPro,
    grantedAccess: compedAreas(u),
    adminAreas: parseAdminAreas(u.adminAreas),
    // An owner holds every area through the env allowlist, not through this column, so the
    // row says so instead of showing ten empty chips that can't be filled in.
    isOwnerAdmin: isAdminEmail(u.email) || isAdminEmail(u.licenseEmail),
    isFoundingFunder: u.foundingFunder?.paymentStatus === "confirmed",
    createdAt: u.createdAt.toISOString(),
    // Stamped on every Home visit (see lib/session.ts recordHomeVisit) — the closest thing
    // this app has to a "last active" signal, since createdAt alone only ever tells you
    // when an account was first made, not whether anyone has used it since. Null for an
    // account that's never opened Home (e.g. never made it past onboarding).
    lastVisitedAt: u.lastVisitedAt?.toISOString() ?? null,
  }));

  return (
    <div className="screen-pad" style={{ maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Accounts</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
        Every registered account, {rows.length} total.{" "}
        {canManageAdmins
          ? "Use Co-Admin to give someone access to specific behind-the-scenes areas, or to take it back."
          : "Co-admin access is shown here but can only be changed by a full admin."}
      </p>

      <div className="card elev-sm">
        <AccountsAdminTable rows={rows} canManageAdmins={canManageAdmins} />
      </div>
    </div>
  );
}
