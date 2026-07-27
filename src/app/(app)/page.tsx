import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/articles";
import { decorateArticle, rankFeed } from "@/lib/feed";
import { firstName as firstNameOf } from "@/lib/meta";
import { getUsphSeries, buildStockView } from "@/lib/stock";
import { attachRealImages } from "@/lib/og-image";
import { HomeFeed } from "@/components/HomeFeed";
import type { ArticleType, Specialty } from "@/lib/types";

// "Purely news-based": general news from news outlets, not academic journals — so the
// revolving card draws from Guidelines/Industry & Policy/Equipment (Google-News-sourced)
// and excludes Research (PubMed) and CE & Events (a curated calendar, not news).
const NEWS_TICKER_TYPES: ArticleType[] = ["guideline", "industry", "product"];
const NEWS_TICKER_SIZE = 6;

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) return null; // layout already redirects; guards TS narrowing below

  const [articles, savedRows, stockSeries] = await Promise.all([
    getArticles(),
    prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } }),
    getUsphSeries(),
  ]);
  const savedIds = savedRows.map((r) => r.articleId);

  const ranked = rankFeed(articles, user.specialty as Specialty, user.followedTopics as unknown as string[]);
  const decorated = ranked.map((a) => decorateArticle(a, savedIds));

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

  return (
    <HomeFeed
      articles={decorated}
      ceEvents={ceEvents}
      stock={stock}
      newsTicker={newsTicker}
      firstName={firstNameOf(user.name)}
    />
  );
}
