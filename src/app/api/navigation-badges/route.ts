import { getAptaNewsArticles } from "@/lib/articles";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { nexusVisibleTo } from "@/lib/nexus-visibility";

export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store" };

/**
 * Nonessential AppShell counts. Keeping these behind a client-initiated request means a
 * cold Google News RSS lookup for APTA-related reporting cannot delay authenticated page
 * HTML. The personalized response itself is never cached; getAptaNewsArticles' underlying
 * fetch retains its existing shared 30-minute `live-news` aggregation cache.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: PRIVATE_HEADERS });
  }

  // A reader Nexus is hidden from has no Nexus nav to badge, and a non-zero count here
  // would be a signal that the feature exists (see lib/nexus-visibility.ts). Don't count,
  // and don't query.
  const showNexus = nexusVisibleTo(user);
  const [aptaArticles, savedCount, nexusRequestCount] = await Promise.all([
    getAptaNewsArticles(),
    prisma.savedArticle.count({ where: { userId: user.id } }),
    showNexus
      ? prisma.connection.count({ where: { recipientId: user.id, status: "pending" } })
      : Promise.resolve(0),
  ]);

  // Match Home's "new since your last visit" cutoff. Home stamps lastVisitedAt via after()
  // so the write is off the HTML critical path; this post-hydration request usually lands
  // after that stamp, clearing APTA counts the reader has just opened Home to see. If it
  // races ahead of after(), the badge briefly uses the previous visit — same articles the
  // feed is already badging as new.
  const sinceVisit = user.lastVisitedAt?.getTime() ?? 0;
  const aptaCount = aptaArticles.filter((article) => new Date(article.date).getTime() > sinceVisit).length;

  return Response.json({ aptaCount, savedCount, nexusRequestCount }, { headers: PRIVATE_HEADERS });
}
