import { redirect } from "next/navigation";
import { isSiteAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { LicenseVerificationQueue } from "@/components/LicenseVerificationQueue";

/** Admin-only — read-only queue of every pending license verification submission (see
 *  components/AddLicenseModal.tsx, app/actions/license.ts). Same "must be admin" redirect
 *  idiom as /admin/suggestions. */
export default async function AdminLicensesPage() {
  if (!(await isSiteAdmin())) redirect("/home");

  const users = await prisma.user.findMany({
    where: { licenseStatus: "pending" },
    orderBy: { licenseSubmittedAt: "asc" },
    select: { id: true, name: true, licenseState: true, licenseNumber: true, licenseFullName: true, licenseSubmittedAt: true },
  });
  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    licenseState: u.licenseState,
    licenseNumber: u.licenseNumber,
    licenseFullName: u.licenseFullName,
    submittedAt: u.licenseSubmittedAt?.toISOString() ?? null,
  }));

  return (
    <div className="screen-pad" style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>License Verification Queue</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
        Pending license submissions from the Profile page&rsquo;s Add License flow, {rows.length} awaiting review.
      </p>

      <div className="card elev-sm">
        <LicenseVerificationQueue rows={rows} />
      </div>
    </div>
  );
}
