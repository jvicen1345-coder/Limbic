import { redirect } from "next/navigation";
import { isSiteAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { compedAreas } from "@/lib/session";
import { AccountsAdminTable } from "@/components/AccountsAdminTable";

/** Admin-only — every account, with a delete button per row (see AccountsAdminTable.tsx,
 *  deleteUserAction in app/actions/admin.ts). Same "must be admin" redirect idiom as
 *  /admin/suggestions, /admin/licenses, /admin/connexion-visits. */
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
      passwordHash: true,
      googleId: true,
      isPro: true,
      compedAccess: true,
      createdAt: true,
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
    isFoundingFunder: u.foundingFunder?.paymentStatus === "confirmed",
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="screen-pad" style={{ maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Accounts</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
        Every registered account, {users.length} total. Visible only to site admins.
      </p>

      <div className="card elev-sm">
        <AccountsAdminTable rows={rows} />
      </div>
    </div>
  );
}
