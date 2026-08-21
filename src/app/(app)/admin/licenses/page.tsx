import { redirect } from "next/navigation";
import { isSiteAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { LicenseVerificationQueue } from "@/components/LicenseVerificationQueue";

/** Admin-only — read-only queue of every pending license verification submission (see
 *  components/AddLicenseModal.tsx, app/actions/license.ts). One row per pending License,
 *  not per reader — a reader with licenses in two states pending at once shows up twice,
 *  each independently reviewable. Same "must be admin" redirect idiom as /admin/suggestions. */
export default async function AdminLicensesPage() {
  if (!(await isSiteAdmin())) redirect("/home");

  const pending = await prisma.license.findMany({
    where: { status: "pending" },
    orderBy: { submittedAt: "asc" },
    select: { id: true, state: true, licenseNumber: true, fullName: true, submittedAt: true, user: { select: { name: true } } },
  });
  const rows = pending.map((l) => ({
    id: l.id,
    accountName: l.user.name,
    state: l.state,
    licenseNumber: l.licenseNumber,
    fullName: l.fullName,
    submittedAt: l.submittedAt.toISOString(),
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
