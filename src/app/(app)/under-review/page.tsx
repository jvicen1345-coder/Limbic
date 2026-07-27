import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getUnderReviewArticles } from "@/lib/articles";
import { decorateArticle } from "@/lib/feed";
import { ReviewCard } from "@/components/RowCards";
import { Pagination } from "@/components/Pagination";
import { parsePageParam, paginate } from "@/lib/pagination";

export default async function UnderReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!user.licenseNumber) {
    return (
      <div className="screen-pad">
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Under Review</h1>
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>
          Available to signed-in clinicians only — add your license from your profile to unlock this.
        </p>
      </div>
    );
  }

  const [reviewArticlesRaw, savedRows, { page: requestedPage }] = await Promise.all([
    getUnderReviewArticles(),
    prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } }),
    searchParams,
  ]);
  const savedIds = savedRows.map((r) => r.articleId);
  const { pageItems, page, totalPages } = paginate(reviewArticlesRaw, parsePageParam(requestedPage));
  const reviewArticles = pageItems.map((a) => decorateArticle(a, savedIds));

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Under Review</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 22px" }}>
        Retractions, corrections, and expressions of concern from PT/rehab journals, sourced from the{" "}
        <a
          href="https://gitlab.com/crossref/retraction-watch-data"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit" }}
        >
          Crossref/Retraction Watch database
        </a>
        .
      </p>
      {reviewArticles.length > 0 ? (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {reviewArticles.map((a) => (
              <ReviewCard key={a.id} article={a} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} basePath="/under-review" />
        </>
      ) : (
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>No flagged articles right now.</p>
      )}
    </div>
  );
}
