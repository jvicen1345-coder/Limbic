import Link from "next/link";
import { redirect } from "next/navigation";
import { isSiteAdmin } from "@/lib/admin";
import { listSafetyAssessments } from "@/app/actions/connexion-safety-score";

/** Admin-only — every Connexion Safety Score assessment administered so far (see
 *  ConnexionSafetyAssessment in schema.prisma, listSafetyAssessments in
 *  app/actions/connexion-safety-score.ts). Same "must be admin" redirect idiom as
 *  /admin/connexion-visits and /admin/licenses. */
export default async function AdminConnexionSafetyScorePage() {
  if (!(await isSiteAdmin())) redirect("/home");

  const assessments = await listSafetyAssessments();

  return (
    <div className="screen-pad" style={{ maxWidth: 960, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Connexion Safety Score Assessments</h1>
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
            {assessments.length} completed. Visible only to site admins.
          </p>
        </div>
        <Link href="/admin/connexion-safety-score/new" className="btn btn-primary">
          New Assessment
        </Link>
      </div>

      <div className="card elev-sm">
        {assessments.length === 0 ? (
          <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: 0 }}>No assessments yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--color-neutral-700)" }}>
                  <th style={{ padding: "4px 10px 4px 0", fontWeight: 600 }}>Client</th>
                  <th style={{ padding: "4px 10px", fontWeight: 600 }}>Date</th>
                  <th style={{ padding: "4px 10px", fontWeight: 600 }}>Total Score</th>
                  <th style={{ padding: "4px 10px", fontWeight: 600 }}>Risk Level</th>
                  <th style={{ padding: "4px 0 4px 10px", fontWeight: 600 }}>Administered By</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => (
                  <tr key={a.id} style={{ borderTop: "1px solid var(--color-neutral-200)" }}>
                    <td style={{ padding: "8px 10px 8px 0" }}>
                      <Link href={`/admin/connexion-safety-score/${a.id}`}>{a.clientName}</Link>
                    </td>
                    <td style={{ padding: "8px 10px", color: "var(--color-neutral-700)", whiteSpace: "nowrap" }}>
                      {new Date(a.assessmentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td style={{ padding: "8px 10px", color: "var(--color-neutral-700)" }}>{a.totalScore} / 208</td>
                    <td style={{ padding: "8px 10px" }}>
                      <span className="connexion-badge-soon">{a.riskLevel}</span>
                    </td>
                    <td style={{ padding: "8px 0 8px 10px", color: "var(--color-neutral-700)" }}>{a.administeredByName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
