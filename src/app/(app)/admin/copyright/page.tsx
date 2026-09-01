import { redirect } from "next/navigation";
import { isSiteAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { countsAsStrike, STRIKE_THRESHOLD } from "@/lib/copyright";
import { CopyrightNoticeQueue, type NoticeRow, type InfringerRow } from "@/components/CopyrightNoticeQueue";

/** Admin-only — the working end of the DMCA policy published at /dmca. Notices of claimed
 *  infringement are logged here, acted on here, and never deleted, because §512(i)
 *  conditions safe harbor on the repeat-infringer policy being *reasonably implemented* and
 *  this table is the evidence of that. Same "must be admin" redirect idiom as
 *  /admin/suggestions and /admin/licenses.
 *
 *  Note this page reads content without lib/copyright.ts's visibleContentWhere filter, on
 *  purpose and uniquely: an admin has to be able to see material that has already been
 *  taken down in order to review a counter-notice and decide whether to reinstate it. */
export default async function AdminCopyrightPage() {
  if (!(await isSiteAdmin())) redirect("/home");

  const notices = await prisma.copyrightNotice.findMany({
    orderBy: { receivedAt: "desc" },
    include: { targetAuthor: { select: { id: true, name: true, email: true, suspendedAt: true } } },
  });

  // The reported content itself, so the queue can show what a notice is actually about
  // rather than a bare id. Two batched lookups instead of one per row.
  const postIds = notices.filter((n) => n.targetType === "post").map((n) => n.targetId);
  const commentIds = notices.filter((n) => n.targetType === "comment").map((n) => n.targetId);
  const [posts, comments] = await Promise.all([
    postIds.length
      ? prisma.nexusPost.findMany({ where: { id: { in: postIds } }, select: { id: true, body: true, removedAt: true } })
      : Promise.resolve([]),
    commentIds.length
      ? prisma.nexusPostComment.findMany({
          where: { id: { in: commentIds } },
          select: { id: true, body: true, removedAt: true },
        })
      : Promise.resolve([]),
  ]);
  const contentById = new Map<string, { body: string; removedAt: Date | null }>();
  for (const p of posts) contentById.set(p.id, { body: p.body, removedAt: p.removedAt });
  for (const c of comments) contentById.set(c.id, { body: c.body, removedAt: c.removedAt });

  const rows: NoticeRow[] = notices.map((n) => {
    const content = contentById.get(n.targetId);
    return {
      id: n.id,
      receivedAt: n.receivedAt.toISOString(),
      complainantName: n.complainantName,
      complainantEmail: n.complainantEmail,
      workDescription: n.workDescription,
      targetType: n.targetType,
      targetId: n.targetId,
      status: n.status,
      actionedAt: n.actionedAt?.toISOString() ?? null,
      notes: n.notes,
      authorId: n.targetAuthor.id,
      authorName: n.targetAuthor.name,
      // Present only when the content still exists — an author can delete their own post
      // after a notice lands, and the notice still has to be resolvable.
      contentPreview: content ? content.body.slice(0, 240) : null,
      contentRemoved: content ? content.removedAt !== null : null,
    };
  });

  // One row per account with at least one upheld takedown, so the threshold is something an
  // admin actually sees rather than a number buried in a constant.
  const strikesByAuthor = new Map<string, InfringerRow>();
  for (const n of notices) {
    if (!countsAsStrike(n.status)) continue;
    const existing = strikesByAuthor.get(n.targetAuthor.id);
    if (existing) {
      existing.strikes += 1;
      continue;
    }
    strikesByAuthor.set(n.targetAuthor.id, {
      userId: n.targetAuthor.id,
      name: n.targetAuthor.name,
      email: n.targetAuthor.email,
      strikes: 1,
      suspendedAt: n.targetAuthor.suspendedAt?.toISOString() ?? null,
    });
  }
  const infringers = Array.from(strikesByAuthor.values()).sort((a, b) => b.strikes - a.strikes);
  const openCount = rows.filter((r) => r.status === "received").length;

  return (
    <div className="screen-pad" style={{ maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Copyright Notices</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
        DMCA notices sent to the designated agent published at <a href="/dmca">/dmca</a>, {rows.length} on file,{" "}
        {openCount} awaiting a decision. Logging a notice never removes anything on its own — record it, then
        decide. An account is flagged for review at {STRIKE_THRESHOLD} upheld takedowns; suspension stays a
        decision you make, not an automatic one.
      </p>

      <CopyrightNoticeQueue rows={rows} infringers={infringers} strikeThreshold={STRIKE_THRESHOLD} />
    </div>
  );
}
