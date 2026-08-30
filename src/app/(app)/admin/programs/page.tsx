import { redirect } from "next/navigation";
import { isSiteAdmin } from "@/lib/admin";
import { getOutreachRecords, getStates, getRegions } from "@/app/actions/dpt-programs";
import { InstitutionalTargetsTable } from "@/components/admin/InstitutionalTargetsTable";

/** Admin-only — institutional-agreement outreach tracker over the same 235 seeded
 *  DPTProgram rows the public /programs directory reads (see app/actions/dpt-programs.ts).
 *  Same "must be admin" redirect idiom as every other /admin page. */
export default async function AdminProgramsPage() {
  if (!(await isSiteAdmin())) redirect("/home");

  const [rows, states, regions] = await Promise.all([getOutreachRecords(), getStates(), getRegions()]);

  return (
    <div className="screen-pad" style={{ maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Institutional Targets</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
        235 CAPTE-accredited DPT programs — track outreach for institutional agreements
      </p>

      <InstitutionalTargetsTable rows={rows} states={states} regions={regions} />
    </div>
  );
}
