import { getCurrentUser, recordHomeVisit, isStudentEmail } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/articles";
import { decorateArticle, rankFeed, type DecoratedArticle } from "@/lib/feed";
import { firstName as firstNameOf, timeOfDayGreeting, credentialFromName } from "@/lib/meta";
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

  const [articles, savedRows, readRows, readCalendarRows, stockSeries, previousVisit, lastReadArticle] = await Promise.all([
    getArticles(),
    prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true, createdAt: true } }),
    prisma.readArticle.findMany({ where: { userId: user.id }, select: { articleId: true } }),
    prisma.readArticle.findMany({
      where: { userId: user.id, createdAt: { gte: readingCalendarStart } },
      select: { createdAt: true },
    }),
    getUsphSeries(),
    recordHomeVisit(user),
    prisma.readArticle.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { articleId: true, scrollProgress: true },
    }),
  ]);
  const savedIds = savedRows.map((r) => r.articleId);
  const readIds = readRows.map((r) => r.articleId);
  const readingWeeks = buildReadingCalendarWeeks(readCalendarRows.map((r) => r.createdAt));

  // Daily PT Dashboard (see components/DailyDashboard.tsx) — greeting/date are computed
  // off the server's local clock, same as every other "today" concept in this app (see
  // lib/reading-calendar.ts, components/CalendarCard.tsx — none of them track a per-user
  // timezone either).
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const credential = credentialFromName(user.name);
  const greetingName = firstNameOf(user.name);
  const greeting = `${timeOfDayGreeting(now.getHours())}, ${greetingName}${credential ? `, ${credential}` : ""}`;
  const dateLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const newStudiesToday = articles.filter((a) => a.type === "research" && a.date === todayStr).length;
  const newGuidelinesToday = articles.filter((a) => a.type === "guideline" && a.date === todayStr).length;
  // Limbic Boards' daily question is normally a student-only product (see
  // app/(app)/boards/page.tsx), but a licensed PT/clinician account gets access to just
  // that one question — not the rest of Boards — so the dashboard card shows for both.
  const showQuestionOfDay = isStudentEmail(user.email) || user.licenseNumber != null;
  const ceHoursCompleted = (user.ceCategories as unknown as CeCategory[]).reduce((sum, c) => sum + c.completed, 0);

  // Falls back to null (renders nothing — see ContinueReadingCard) if there's no reading
  // history yet, or if the most recently read article has since dropped out of the current
  // pool (a live-sourced article can churn out from under an old ReadArticle row).
  const lastReadArticleMeta = lastReadArticle ? articles.find((a) => a.id === lastReadArticle.articleId) : null;
  const continueReading = lastReadArticleMeta
    ? (() => {
        const remainingMins = lastReadArticleMeta.readMins * (1 - lastReadArticle!.scrollProgress);
        return {
          articleId: lastReadArticleMeta.id,
          title: lastReadArticleMeta.title,
          progress: lastReadArticle!.scrollProgress,
          remainingLabel: remainingMins < 1 ? "< 1 min left" : `${Math.ceil(remainingMins)} min left`,
        };
      })()
    : null;

  const ranked = rankFeed(articles, user.specialty as Specialty, user.followedTopics as unknown as string[]);
  const decorated = ranked.map((a) => decorateArticle(a, savedIds, previousVisit, readIds));

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
  const newsTicker = newsTickerWithImages.map((a) => decorateArticle(a, savedIds, null, readIds));

  const stock = buildStockView(stockSeries);

  const readIdSet = new Set(readIds);
  const decoratedById = new Map(decorated.map((a) => [a.id, a]));
  const savedUnreadRows = savedRows.filter((r) => !readIdSet.has(r.articleId));
  const savedUnread = savedUnreadRows
    .slice()
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

  const dashboard = {
    greeting,
    dateLabel,
    newStudiesToday,
    newGuidelinesToday,
    showQuestionOfDay,
    streakDays: user.streakDays,
    ceHoursCompleted,
    savedUnfinishedCount: savedUnreadRows.length,
  };

  return (
    <HomeFeed
      articles={decorated}
      ceEvents={ceEvents}
      stock={stock}
      newsTicker={newsTicker}
      license={license}
      savedUnread={savedUnread}
      nexusSuggestions={nexusSuggestions}
      streakDays={user.streakDays}
      readingWeeks={readingWeeks}
      continueReading={continueReading}
      dashboard={dashboard}
    />
  );
}
