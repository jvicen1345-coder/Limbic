import { redirect } from "next/navigation";
import { isSiteAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { compedAreas, isAdminEmail } from "@/lib/session";
import { parseAdminAreas } from "@/lib/admin-areas";
import { AccountsAdminTable } from "@/components/AccountsAdminTable";

/** Owner-only — every account, with a delete button per row (see AccountsAdminTable.tsx,
 *  deleteUserAction in app/actions/admin.ts), and the Co-Admin column that appoints and
 *  un-appoints co-admins.
 *
 *  The one admin page with no delegable area behind it (see lib/admin-areas.ts): it carries
 *  the whole reader list — every email, sign-in method and billing state — along with account
 *  deletion and the controls that hand out admin access. So unlike /admin/suggestions or
 *  /admin/licenses, which gate on holding their area, this gates on being an allowlist owner,
 *  and a co-admin is redirected home like anyone else. */
export default async function AdminAccountsPage() {
  if (!(await isSiteAdmin())) redirect("/home");

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
    /* Wider than the 960 the other admin pages use: this table carries eleven columns since
       Co-Admin joined it, and at 960 the per-row Delete button sat outside the visible width
       of its own scroll container. */
    <div className="screen-pad" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Accounts</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
        Every registered account, {rows.length} total. Use Co-Admin to give someone access to
        specific behind-the-scenes areas, or to take it back.
      </p>

      <div className="card elev-sm">
        <AccountsAdminTable rows={rows} />
      </div>
    </div>
  );
}
