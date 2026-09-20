import type { Metadata } from "next";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Roundup",
};
import { decorateArticle } from "@/lib/feed";
import { currentWeekKey, pickWeeklyRoundup } from "@/lib/student-roundup";
import { NewsRow } from "@/components/RowCards";
import { StudentPlaceholderPage } from "@/components/StudentPlaceholderPage";
import { StudentGate } from "@/components/student/StudentGate";

const SUBTITLE = "Five real research, guideline, and CE items pulled from the same feed as News, refreshed every week.";

/** Free to any .edu sign-in (see hasStudentAccess) — only Playbooks and Limbic Boards stay
 *  behind the paid LimbicStudent tier; everything else in the student experience, this
 *  included, opened up when that line was redrawn. */
export default async function StudentRoundupPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!hasStudentAccess(user)) {
    return (
      <StudentPlaceholderPage title="Weekly Roundup" subtitle={SUBTITLE}>
        <StudentGate toolName="Weekly Roundup" />
      </StudentPlaceholderPage>
    );
  }

  const [allArticles, savedRows] = await Promise.all([
    getArticles(),
    prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } }),
  ]);
  const savedIds = savedRows.map((r) => r.articleId);

  // "Coursework-curated" means the substantive, study-relevant slice of the feed — the same
  // real research/guideline/CE content News and the article detail page already serve, just
  // dropping the two equipment/industry-marketing types, which are the two article types no
  // DPT program actually assigns as reading.
  const courseworkPool = allArticles.filter((a) => a.type !== "industry" && a.type !== "product");
  const weekKey = currentWeekKey();
  const roundup = pickWeeklyRoundup(courseworkPool, weekKey).map((a) => decorateArticle(a, savedIds));

  return (
    <StudentPlaceholderPage title="Weekly Roundup" subtitle={SUBTITLE}>
      <p style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: "14px 0 0" }}>This week&rsquo;s picks ({weekKey})</p>
      {roundup.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {roundup.map((a) => (
            <NewsRow key={a.id} article={a} />
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)", marginTop: 10 }}>
          Nothing to round up right now, check back soon.
        </p>
      )}
    </StudentPlaceholderPage>
  );
}
