import { getCurrentUser, recordHomeVisit } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/articles";
import { decorateArticle, rankFeed, type DecoratedArticle } from "@/lib/feed";
import { firstName as firstNameOf } from "@/lib/meta";
import { getUsphSeries, buildStockView } from "@/lib/stock";
import { attachRealImages } from "@/lib/og-image";
import { buildLicenseView } from "@/lib/license";
import { HomeFeed } from "@/components/HomeFeed";
import type { ArticleType, CeCategory, Specialty } from "@/lib/types";

// "Purely news-based": general news from news outlets, not academic journals — so the
// revolving card draws from Guidelines/Industry & Policy/Equipment (Google-News-sourced)
// and excludes Research (PubMed) and CE & Events (a curated calendar, not news).
const NEWS_TICKER_TYPES: ArticleType[] = ["guideline", "industry", "product"];
const NEWS_TICKER_SIZE = 6;

// How many saved-but-unread articles to resurface in the sidebar — oldest saved first,
// since those are the ones most overdue.
const SAVED_UNREAD_SIZE = 3;

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) return null; // layout already redirects; guards TS narrowing below

  const [articles, savedRows, readRows, stockSeries, previousVisit] = await Promise.all([
    getArticles(),
    prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true, createdAt: true } }),
    prisma.readArticle.findMany({ where: { userId: user.id }, select: { articleId: true } }),
    getUsphSeries(),
    recordHomeVisit(user),
  ]);
  const savedIds = savedRows.map((r) => r.articleId);

  const ranked = rankFeed(articles, user.specialty as Specialty, user.followedTopics as unknown as string[]);
  const decorated = ranked.map((a) => decorateArticle(a, savedIds, previousVisit));

  const ceEvents = articles
    .filter((a) => a.type === "ce")
    .map((a) => ({ id: a.id, date: a.date, title: a.title, source: a.source, readMins: a.readMins }));

  const newsTickerCandidates = articles
    .filter((a) => NEWS_TICKER_TYPES.includes(a.type))
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, NEWS_TICKER_SIZE);
  const newsTickerWithImages = await attachRealImages(newsTickerCandidates);
  const newsTicker = newsTickerWithImages.map((a) => decorateArticle(a, savedIds));

  const stock = buildStockView(stockSeries);

  const readIds = new Set(readRows.map((r) => r.articleId));
  const decoratedById = new Map(decorated.map((a) => [a.id, a]));
  const savedUnread = savedRows
    .filter((r) => !readIds.has(r.articleId))
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .slice(0, SAVED_UNREAD_SIZE)
    .map((r) => decoratedById.get(r.articleId))
    .filter((a): a is DecoratedArticle => a != null);

  const license = user.licenseNumber
    ? buildLicenseView(
        user.licenseNumber,
        user.licenseState ?? "",
        user.licenseExpiration ?? new Date(),
        user.ceCategories as unknown as CeCategory[]
      )
    : null;

  return (
    <HomeFeed
      articles={decorated}
      ceEvents={ceEvents}
      stock={stock}
      newsTicker={newsTicker}
      firstName={firstNameOf(user.name)}
      license={license}
      savedUnread={savedUnread}
    />
  );
}
