import type { Metadata } from "next";
import { getCurrentUser, recordHomeVisit, hasBackupSigninFlag, isAdminEmail } from "@/lib/session";
import { hasMigrationBannerDismissed } from "@/app/actions/account-migration";
import { GRADUATION_TRANSITION_SNOOZE_DAYS } from "@/lib/migration-reminder";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/articles";
import { decorateArticle, rankFeed, type DecoratedArticle } from "@/lib/feed";
import { firstName as firstNameOf, timeOfDayGreeting, credentialFromName } from "@/lib/meta";
import { getIndustryIndexView } from "@/lib/stock";
import { attachRealImages } from "@/lib/og-image";
import { attachTopicImages } from "@/lib/topic-image";
import { buildLicenseView } from "@/lib/license";
import { ensureNexusSeedData } from "@/lib/nexus-seed";
import { getConnectionStates } from "@/lib/nexus";
import { buildLimbicAgentInsights } from "@/lib/limbic-agent-insights";
import { parseInterestProfile } from "@/lib/llm-interest-profile";
import { todayLocalDateStr } from "@/lib/today";
import { todayDateKey } from "@/lib/wordle-words";
import { homeQuestionForDate } from "@/lib/home-questions-static";
import { HomeFeed } from "@/components/HomeFeed";
import { LimbicCalendarWidget } from "@/components/LimbicCalendarWidget";
import { getFoundingFunderStatus } from "@/lib/founding-funders";
import { visitorHourOfDay } from "@/lib/timezone";
import type { NexusSuggestion } from "@/components/NexusSuggestionsCard";
import type { Article, CeCategory, Specialty } from "@/lib/types";

export const metadata: Metadata = {
  title: "Home",
};

// How many people to suggest connecting with in the Home aside — enough to fill the
// card without turning it into a second directory.
const NEXUS_SUGGESTIONS_SIZE = 3;

// How many saved-but-unread articles to resurface in the sidebar — oldest saved first,
// since those are the ones most overdue.
const SAVED_UNREAD_SIZE = 3;

// Home shows a minimum of 7 cards, no pagination: the hero plus a grid below it (see
// HomeFeed.tsx's MIN_HOME_CARDS/GRID_SIZE — normally 1 hero + 6 grid, but the grid grows to
// 7 on its own if the hero pool ever comes up empty), and every one of those cards needs a
// real picture. Rather than trying a fixed-size slice of the ranked pool and accepting
// however many happen to resolve an image, this walks deeper into the pool in batches —
// attempting a real og:image fetch (lib/og-image.ts) then a topic stock-photo fallback
// (lib/topic-image.ts) per batch — until enough *distinct-image* candidates exist for the
// grid's worst case of 7 (the hero doesn't need a distinct one; see HomeFeed.tsx) plus a
// small hero rotation pool, or the search cap is hit. RefreshHomeFeedButton re-running this
// (see app/actions/home.ts) is the intended way a reader waits through a thin/unlucky batch.
const IMAGE_SEARCH_BATCH = 16;
const IMAGE_SEARCH_MAX = 96;
const HOME_GRID_SIZE = 7;
const HOME_HERO_POOL_SIZE = 5;

/** Attaches images to `ranked`, batch by batch, stopping once there are enough resolved
 *  candidates to fill the grid (with mutually distinct images) plus a hero pool, or once
 *  IMAGE_SEARCH_MAX is reached. Returns every article it attempted (imaged or not, in
 *  their original rank order) — the shape HomeFeed already expects for the rest of the
 *  ranked pool (see rankedForDisplay below), just with more of the prefix processed than
 *  the old fixed FEED_IMAGE_LIMIT ever guaranteed. */
async function resolveHomeImages(ranked: Article[]): Promise<Article[]> {
  const processed: Article[] = [];
  const seenImages = new Set<string>();
  let distinctImaged = 0;
  let totalImaged = 0;

  for (let offset = 0; offset < Math.min(ranked.length, IMAGE_SEARCH_MAX); offset += IMAGE_SEARCH_BATCH) {
    const batch = ranked.slice(offset, offset + IMAGE_SEARCH_BATCH);
    const withReal = await attachRealImages(batch);
    const withTopic = await attachTopicImages(withReal);
    processed.push(...withTopic);

    for (const a of withTopic) {
      if (!a.image) continue;
      totalImaged++;
      if (!seenImages.has(a.image)) {
        seenImages.add(a.image);
        distinctImaged++;
      }
    }
    if (distinctImaged >= HOME_GRID_SIZE && totalImaged >= HOME_GRID_SIZE + HOME_HERO_POOL_SIZE) break;
  }

  return processed;
}

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) return null; // layout already redirects; guards TS narrowing below

  const [articles, savedRows, readRows, industryIndex, previousVisit, lastReadArticle, backupSigninFlag, migrationBannerDismissed] =
    await Promise.all([
      getArticles(),
      prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true, createdAt: true } }),
      // Ordered most-recently-touched first — also feeds buildLimbicAgentInsights below,
      // which needs that ordering to find each topic's most recent read in one pass.
      prisma.readArticle.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        // scrollProgress feeds rankFeed's implicit affinity model below (a completed read
        // counts for more than a bounce) — updatedAt/articleId alone used to be enough
        // when this only fed buildLimbicAgentInsights' recency lookup.
        select: { articleId: true, updatedAt: true, scrollProgress: true },
      }),
      getIndustryIndexView(),
      recordHomeVisit(user),
      prisma.readArticle.findFirst({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        select: { articleId: true, scrollProgress: true },
      }),
      hasBackupSigninFlag(),
      hasMigrationBannerDismissed(),
    ]);

  // Same server-clock snapshot DailyDashboard's greeting/date use further down — one `now`
  // for the whole render rather than separate Date.now() calls scattered through it.
  const now = new Date();

  // The three account-migration surfaces (see components/BackupSigninBanner.tsx,
  // MigrationReminderBanner.tsx, GraduationTransitionCard.tsx) — computed here rather than
  // in HomeFeed so the client component only ever gets plain booleans, never raw account
  // fields it doesn't otherwise need.
  const isStudentTier = user.studentTier !== "none";
  const showBackupSigninBanner = backupSigninFlag;
  const showMigrationReminderBanner =
    isStudentTier && user.backupEmail === null && user.migrationEmailSentAt !== null && !migrationBannerDismissed;
  const showGraduationTransitionCard =
    isStudentTier &&
    user.graduationDate !== null &&
    user.graduationDate.getTime() <= now.getTime() &&
    (user.graduationTransitionShownAt === null ||
      now.getTime() - user.graduationTransitionShownAt.getTime() >= GRADUATION_TRANSITION_SNOOZE_DAYS * 24 * 60 * 60 * 1000);
  const savedIds = savedRows.map((r) => r.articleId);
  const readIds = readRows.map((r) => r.articleId);
  const readIdSet = new Set(readIds);
  const limbicAgentInsights = buildLimbicAgentInsights(
    readRows,
    articles,
    user.followedTopics as unknown as string[],
    user.createdAt
  );

  // Daily PT Dashboard (see components/DailyDashboard.tsx) — dateLabel/todayStr stay on the
  // server's local clock, same as every other "today" concept in this app (see
  // lib/reading-calendar.ts, components/CalendarCard.tsx — none of them track a per-user
  // timezone either). The greeting is the one exception — see lib/timezone.ts for why.
  const todayStr = todayLocalDateStr(now);
  const credential = credentialFromName(user.name);
  const greetingName = firstNameOf(user.name);
  const greeting = `${timeOfDayGreeting(await visitorHourOfDay())}, ${greetingName}${credential ? `, ${credential}` : ""}`;
  const dateLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const newStudiesToday = articles.filter((a) => a.type === "research" && a.date === todayStr).length;
  const newGuidelinesToday = articles.filter((a) => a.type === "guideline" && a.date === todayStr).length;
  const ceHoursCompleted = (user.ceCategories as unknown as CeCategory[]).reduce((sum, c) => sum + c.completed, 0);

  // Home's own general-audience "Question of the Day" (see components/HomeQuestionCard.tsx)
  // — distinct from Limbic Boards' student-facing daily question, which stays on
  // app/(app)/boards/sharpening/page.tsx. Same todayDateKey() rotation + DailyCompletion
  // persistence pattern as every other daily game in this app.
  const homeQuestionDateKey = todayDateKey();
  const homeQuestion = homeQuestionForDate(homeQuestionDateKey);
  const homeQuestionCompletionPromise = prisma.dailyCompletion.findUnique({
    where: { userId_kind_dateKey: { userId: user.id, kind: "homeQuestion", dateKey: homeQuestionDateKey } },
  });

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

  // Already-read articles don't resurface as fresh recommendations on Home — Continue
  // Reading (below) is the dedicated path back to something already opened, and every
  // other Home surface (hero, grid, type tabs — all built from `ranked`) is meant to be
  // "what's new for you". Filtered before resolveHomeImages/attachTopicImages run below so
  // the "every visible card needs a real picture" guarantee sizes itself off the actual
  // unread pool instead of coming up short after read articles get dropped later.
  const rankedAll = rankFeed({
    articles,
    specialty: user.specialty as Specialty,
    followedTopics: user.followedTopics as unknown as string[],
    readRows,
    savedRows,
    llmProfile: parseInterestProfile(user.llmInterestProfile),
  });
  const ranked = rankedAll.filter((a) => !readIdSet.has(a.id));

  const ceEvents = articles
    .filter((a) => a.type === "ce")
    .map((a) => ({ id: a.id, date: a.date, title: a.title, source: a.source, readMins: a.readMins }));

  // Independent of each other, so run concurrently rather than making the og-image scrape
  // (always runs) wait behind the Nexus lookups (only when nexusOptIn is set), or vice
  // versa. Suggestions are only meaningful (and only shown) once the viewer has opted into
  // Nexus themselves — otherwise the aside offers a join prompt instead (see HomeFeed).
  // Nexus itself is gated to admins only for now (see app/(app)/nexus/layout.tsx) — a
  // non-admin's nexusOptIn just means "on the waitlist," so real suggested-people data
  // (names, headlines, working Connect buttons) must not reach the Home sidebar for them
  // the way it does for an admin, even though the flag is set the same way for both.
  const isAdminUser = isAdminEmail(user.email) || isAdminEmail(user.licenseEmail);
  const nexusSuggestionsPromise: Promise<NexusSuggestion[] | null> = user.nexusOptIn && isAdminUser
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

  const [homeImagedPrefix, nexusSuggestions, homeQuestionCompletion, foundingFunderStatus] = await Promise.all([
    resolveHomeImages(ranked),
    nexusSuggestionsPromise,
    homeQuestionCompletionPromise,
    getFoundingFunderStatus(user.id),
  ]);
  // null hides the number next to the greeting entirely — either not a confirmed funder, or
  // the reader's turned their badge off (see components/FoundingFunderBadgeCard.tsx).
  const foundingFunderNumber =
    foundingFunderStatus.isFunder && !user.foundingFunderBadgeHidden ? foundingFunderStatus.number : null;
  // resolveHomeImages stops once it's found enough images for the *default* "All" view —
  // everything ranked after that point is still real content (a reader can reach it via a
  // type/specialty tab or a Limbic Agent topic filter — see HomeFeed.tsx), just never
  // attempted for an image at all, which is what actually produced "Nothing with a picture
  // in this category yet" rather than any shortage in the bundled pool (lib/topic-photos.ts
  // never returns null — it's a real Commons photo pool, not a network call, so running it
  // over the rest of the ranked list here is cheap: no og:image scrape, no Pexels round
  // trip, just a hash lookup per article). This guarantees every article in `ranked` ends
  // up with a real picture, not only the ones in the processed prefix.
  const rankedTail = await attachTopicImages(ranked.slice(homeImagedPrefix.length));
  const rankedForDisplay = [...homeImagedPrefix, ...rankedTail];
  const decorated = rankedForDisplay.map((a) => decorateArticle(a, savedIds, previousVisit, readIds));

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
    streakDays: user.streakDays,
    ceHoursCompleted,
    savedUnfinishedCount: savedUnreadRows.length,
  };

  return (
    <HomeFeed
      articles={decorated}
      calendarWidget={
        <LimbicCalendarWidget
          personalDates={{
            npteExamDate: user.npteExamDate,
            licenseExpiration: user.licenseExpiration,
            ceuDeadline: user.ceuDeadline,
            certificationExpiry: user.certificationExpiry,
            rotationStartDate: user.rotationStartDate,
            rotationEndDate: user.rotationEndDate,
            graduationDate: user.graduationDate,
            practiceStartDate: user.practiceStartDate,
          }}
          platformEvents={ceEvents}
          isAdmin={isAdminUser}
        />
      }
      stocks={industryIndex}
      license={license}
      savedUnread={savedUnread}
      nexusSuggestions={nexusSuggestions}
      nexusOnWaitlist={!isAdminUser && user.nexusOptIn}
      continueReading={continueReading}
      homeQuestion={{
        dateKey: homeQuestionDateKey,
        question: homeQuestion,
        initialSelectedIndex: homeQuestionCompletion?.selectedIndex ?? null,
      }}
      dashboard={dashboard}
      foundingFunderNumber={foundingFunderNumber}
      hiddenWidgets={user.hiddenHomeWidgets as unknown as string[]}
      limbicAgentInsights={limbicAgentInsights}
      isPro={user.isPro}
      gridSeenFingerprints={(user.homeGridSeenFingerprints as unknown as string[]) ?? []}
      showBackupSigninBanner={showBackupSigninBanner}
      showMigrationReminderBanner={showMigrationReminderBanner}
      showGraduationTransitionCard={showGraduationTransitionCard}
      getTheAppDismissed={user.getTheAppDismissed}
    />
  );
}
