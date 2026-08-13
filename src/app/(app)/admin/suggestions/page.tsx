import { redirect } from "next/navigation";
import { isSiteAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { SuggestionsAdminList } from "@/components/SuggestionsAdminList";

/** Admin-only — the Profile page's anonymous Suggestion Box (see
 *  components/SuggestionBoxCard.tsx, app/actions/suggestions.ts) has no reader-facing
 *  destination; this is the only place any submission is ever read. Redirect-gated rather
 *  than conditionally rendered since this whole page has nothing for a non-admin — same
 *  "must be signed in" idiom app/(app)/layout.tsx already uses, extended to admin status. */
export default async function AdminSuggestionsPage() {
  if (!(await isSiteAdmin())) redirect("/home");

  const rows = await prisma.suggestion.findMany({ orderBy: { createdAt: "desc" } });
  const suggestions = rows.map((r) => ({ id: r.id, body: r.body, createdAt: r.createdAt.toISOString() }));

  return (
    <div className="screen-pad" style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Suggestions</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
        Anonymous suggestions submitted from the Profile page, {suggestions.length} total. Visible only to site admins.
      </p>

      <div className="card elev-sm">
        <SuggestionsAdminList suggestions={suggestions} />
      </div>
    </div>
  );
}
