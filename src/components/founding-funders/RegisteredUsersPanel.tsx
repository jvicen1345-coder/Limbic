/** Read-only, so this stays a server component — no client-side state needed. Same admin
 *  gate as FoundingAdminPanel/WipeAllUsersPanel (see app/founding-funders/page.tsx). Shows
 *  whichever sign-in identifier the account actually has — a General sign-in sets `email`,
 *  a PT license sign-in sets `licenseNumber`/`licenseEmail`, never both at once for the
 *  demo sign-in flows (see lib/session.ts). */
export function RegisteredUsersPanel({
  users,
}: {
  users: { name: string; email: string | null; licenseNumber: string | null; licenseEmail: string | null; isPro: boolean; createdAt: Date }[];
}) {
  return (
    <div className="ff-admin">
      <p className="ff-admin-title">
        Admin — registered users ({users.length})
      </p>
      {users.length === 0 ? (
        <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: 0 }}>No accounts yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--color-neutral-700)" }}>
                <th style={{ padding: "4px 10px 4px 0", fontWeight: 600 }}>Name</th>
                <th style={{ padding: "4px 10px", fontWeight: 600 }}>Sign-in</th>
                <th style={{ padding: "4px 10px", fontWeight: 600 }}>Joined</th>
                <th style={{ padding: "4px 0 4px 10px", fontWeight: 600 }}>Pro</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--color-neutral-200)" }}>
                  <td style={{ padding: "6px 10px 6px 0" }}>{u.name}</td>
                  <td style={{ padding: "6px 10px", color: "var(--color-neutral-700)" }}>
                    {u.email ?? u.licenseEmail ?? u.licenseNumber ?? "—"}
                  </td>
                  <td style={{ padding: "6px 10px", color: "var(--color-neutral-700)", whiteSpace: "nowrap" }}>
                    {u.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td style={{ padding: "6px 0 6px 10px" }}>{u.isPro ? "Yes" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
