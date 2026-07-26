import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/articles";
import { decorateArticle, rankFeed } from "@/lib/feed";
import { firstName as firstNameOf } from "@/lib/meta";
import { getUsphSeries, buildStockView } from "@/lib/stock";
import { HomeFeed } from "@/components/HomeFeed";
import type { Specialty } from "@/lib/types";

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

  const stock = buildStockView(stockSeries);

  return <HomeFeed articles={decorated} ceEvents={ceEvents} stock={stock} firstName={firstNameOf(user.name)} />;
}
