import { redirect } from "next/navigation";
import { isSiteAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { DownloadIcon } from "@/components/icons";

/** Admin-only — every signup on The Connexion Method's certification waitlist (see
 *  ConnexionWaitlist in schema.prisma, joinConnexionWaitlistAction in
 *  app/actions/connexion.ts). Same "must be admin" redirect idiom as /admin/suggestions and
 *  /admin/licenses. CSV export is a placeholder — styled and disabled, not wired up yet. */
export default async function AdminConnexionWaitlistPage() {
  if (!(await isSiteAdmin())) redirect("/home");

  const rows = await prisma.connexionWaitlist.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="screen-pad" style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>Connexion Waitlist</h1>
        <button type="button" className="btn btn-secondary" disabled title="CSV export coming soon">
          <DownloadIcon size={14} /> Export CSV
        </button>
      </div>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
        Certification program signups from /connexion and /connexion/safety-score — {rows.length} total. Visible
        only to site admins.
      </p>

      <div className="card elev-sm">
        {rows.length === 0 ? (
          <p className="card-body">No signups yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {rows.map((r) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 4px",
                  borderBottom: "1px solid var(--color-divider)",
                  fontSize: 13,
                }}
              >
                <span>{r.email}</span>
                <span style={{ color: "var(--color-neutral-700)", fontSize: 12, flexShrink: 0 }}>
                  {r.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
