import { getAptaNewsArticles } from "@/lib/articles";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store" };

/**
 * Nonessential AppShell counts. Keeping these behind a client-initiated request means a
 * cold Google News RSS lookup for APTA-related reporting cannot delay authenticated page
 * HTML. The personalized response itself is never cached; getAptaNewsArticles' underlying
 * fetch retains its existing shared 30-minute `live-news` cache.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: PRIVATE_HEADERS });
  }

  const [aptaArticles, savedCount, nexusRequestCount] = await Promise.all([
    getAptaNewsArticles(),
    prisma.savedArticle.count({ where: { userId: user.id } }),
    prisma.connection.count({ where: { recipientId: user.id, status: "pending" } }),
  ]);

  // Match Home's "new since your last visit" cutoff. On a Home hard load, recordHomeVisit
  // completes before this post-hydration request begins, so the badge reflects that visit
  // instead of briefly showing articles the reader has just landed on Home to see.
  const sinceVisit = user.lastVisitedAt?.getTime() ?? 0;
  const aptaCount = aptaArticles.filter((article) => new Date(article.date).getTime() > sinceVisit).length;

  return Response.json({ aptaCount, savedCount, nexusRequestCount }, { headers: PRIVATE_HEADERS });
}
