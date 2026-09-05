import { redirect } from "next/navigation";
import { isSiteAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { SOURCE_ACCESS, SOURCE_ACCESS_LABELS, type AppraisalInput } from "@/lib/appraisal";
import { appraisalProvenanceCounts } from "@/lib/appraisals-feed";
import { AppraisalWorkbench, type AppraisalRow } from "@/components/admin/AppraisalWorkbench";

/** Admin-only — where Limbic's own research appraisals are written (see lib/appraisal.ts).
 *  Same "must be admin" redirect idiom as /admin/copyright, /admin/suggestions and
 *  /admin/licenses.
 *
 *  Rows are scoped to the signed-in admin rather than to every admin: an appraisal carries a
 *  byline and a point of view, so the list someone works from should be the list they wrote.
 *  The server actions apply the same scope, so this is a matching view rather than the
 *  enforcement (see app/actions/appraisal.ts). */
export default async function AdminAppraisalsPage() {
  if (!(await isSiteAdmin())) redirect("/home");
  const user = await getCurrentUser();
  if (!user) redirect("/home");

  const [records, provenance] = await Promise.all([
    prisma.studyAppraisal.findMany({
      where: { authorId: user.id },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    }),
    appraisalProvenanceCounts(),
  ]);

  const rows: AppraisalRow[] = records.map((r) => ({
    id: r.id,
    status: r.status,
    updatedAt: r.updatedAt.toISOString(),
    publishedAt: r.publishedAt?.toISOString() ?? null,
    input: r.input as unknown as AppraisalInput,
    summary: r.summary,
    body: (r.body as string[]) ?? [],
    specialty: r.specialty,
    tags: (r.tags as string[]) ?? [],
  }));

  const publishedCount = rows.filter((r) => r.status === "published").length;

  return (
    <div className="screen-pad" style={{ maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Appraisals</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 12px" }}>
        Your own read of a paper, published into the research feed under a Limbic byline. {rows.length} on file,{" "}
        {publishedCount} published. The form takes the figures you extracted and your notes — never the article
        itself, which is what keeps this clear of publishers&rsquo; terms and of anyone else&rsquo;s copyright.
      </p>
      <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
        Published by access:{" "}
        {SOURCE_ACCESS.map((key, i) => (
          <span key={key}>
            {i > 0 ? " · " : ""}
            {SOURCE_ACCESS_LABELS[key]} {provenance[key]}
          </span>
        ))}
        . Kept so &ldquo;which of these did you write from a subscription copy?&rdquo; is a question with an
        immediate answer.
      </p>

      <AppraisalWorkbench rows={rows} />
    </div>
  );
}
