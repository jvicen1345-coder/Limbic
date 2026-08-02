import { getCurrentUser, recordHomeVisit } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/articles";
import { decorateArticle, rankFeed, type DecoratedArticle } from "@/lib/feed";
import { firstName as firstNameOf } from "@/lib/meta";
import { getUsphSeries, buildStockView } from "@/lib/stock";
import { attachRealImages } from "@/lib/og-image";
import { buildLicenseView } from "@/lib/license";
import { ensureNexusSeedData } from "@/lib/nexus-seed";
import { getConnectionStates } from "@/lib/nexus";
import { buildReadingCalendarWeeks } from "@/lib/reading-calendar";
import { HomeFeed } from "@/components/HomeFeed";
import type { NexusSuggestion } from "@/components/NexusSuggestionsCard";
import type { ArticleType, CeCategory, Specialty } from "@/lib/types";

// How many people to suggest connecting with in the Home aside — enough to fill the
// card without turning it into a second directory.
const NEXUS_SUGGESTIONS_SIZE = 3;

const READING_CALENDAR_WINDOW_DAYS = 365;

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

  const readingCalendarStart = new Date();
  readingCalendarStart.setDate(readingCalendarStart.getDate() - (READING_CALENDAR_WINDOW_DAYS - 1));

  const [articles, savedRows, readRows, readCalendarRows, stockSeries, previousVisit] = await Promise.all([
    getArticles(),
    prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true, createdAt: true } }),
    prisma.readArticle.findMany({ where: { userId: user.id }, select: { articleId: true } }),
    prisma.readArticle.findMany({
      where: { userId: user.id, createdAt: { gte: readingCalendarStart } },
      select: { createdAt: true },
    }),
    getUsphSeries(),
    recordHomeVisit(user),
  ]);
  const savedIds = savedRows.map((r) => r.articleId);
  const readingWeeks = buildReadingCalendarWeeks(readCalendarRows.map((r) => r.createdAt));

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

  // Independent of each other, so run concurrently rather than making the og-image scrape
  // (always runs) wait behind the Nexus lookups (only when nexusOptIn is set), or vice
  // versa. Suggestions are only meaningful (and only shown) once the viewer has opted into
  // Nexus themselves — otherwise the aside offers a join prompt instead (see HomeFeed).
  const nexusSuggestionsPromise: Promise<NexusSuggestion[] | null> = user.nexusOptIn
    ? (async () => {
        await ensureNexusSeedData();
        const [nexusCandidates, connectionStates] = await Promise.all([
          prisma.user.findMany({
            where: { id: { not: user.id }, isGuest: false, nexusOptIn: true },
            select: { id: true, name: true, headline: true },
            orderBy: { createdAt: "asc" },
            take: 25,
          }),
          getConnectionStates(user.id),
        ]);
        return nexusCandidates
          .filter((p) => (connectionStates.get(p.id) ?? { status: "none" as const }).status === "none")
          .slice(0, NEXUS_SUGGESTIONS_SIZE)
          .map((p) => ({ id: p.id, name: p.name, headline: p.headline, state: { status: "none" } }));
      })()
    : Promise.resolve(null);

  const [newsTickerWithImages, nexusSuggestions] = await Promise.all([
    attachRealImages(newsTickerCandidates),
    nexusSuggestionsPromise,
  ]);
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
      nexusSuggestions={nexusSuggestions}
      streakDays={user.streakDays}
      readingWeeks={readingWeeks}
    />
  );
}
