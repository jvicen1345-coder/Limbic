"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, XIcon, DownloadIcon, RefreshIcon } from "@/components/icons";
import { slugifyTopic } from "@/lib/topic-slug";
import { SlidingTabs } from "@/components/SlidingTabs";
import { ArticleCard } from "@/components/ArticleCard";
import { HeroFeed } from "@/components/HeroFeed";
import { ContinueReadingCard, type ContinueReadingData } from "@/components/ContinueReadingCard";
import { HomeQuestionCard, type HomeQuestionData } from "@/components/HomeQuestionCard";
import { DailyDashboard, type DailyDashboardData } from "@/components/DailyDashboard";
import { LimbicAgentCard } from "@/components/LimbicAgentCard";
import { BackupSigninBanner } from "@/components/BackupSigninBanner";
import { MigrationReminderBanner } from "@/components/MigrationReminderBanner";
import { GraduationTransitionCard } from "@/components/GraduationTransitionCard";
import { RefreshHomeFeedButton } from "@/components/RefreshHomeFeedButton";
import { PullToRefresh } from "@/components/PullToRefresh";
import { refreshHomeFeedAction } from "@/app/actions/home";
import { orderArticlesForGrid, titleFingerprint } from "@/lib/home-grid-rotation";
import { StockCard } from "@/components/StockCard";
import { SavedUnreadCard } from "@/components/SavedUnreadCard";
import { NexusSuggestionsCard, type NexusSuggestion } from "@/components/NexusSuggestionsCard";
import { NexusJoinPromptCard } from "@/components/NexusJoinPromptCard";
import { FoundingFunderBadge } from "@/components/FoundingFunderBadge";
import type { DecoratedArticle } from "@/lib/feed";
import type { ArticleType } from "@/lib/types";
import type { StockView } from "@/lib/stock";
import type { LicenseView } from "@/lib/license";
import type { LimbicAgentInsights } from "@/lib/limbic-agent-insights";

// How many of the top-ranked articles the hero rotates through.
const HERO_SIZE = 5;

// No pagination — the middle panel (hero + grid) always shows at least this many cards.
// Every one needs a real picture (see page.tsx's resolveHomeImages, which searches deeper
// into the ranked pool than a fixed slice would to make that realistic); RefreshHomeFeedButton
// is the intended way a reader waits through a thin/unlucky batch rather than paging past it.
const MIN_HOME_CARDS = 7;

// The grid's normal size when the hero is showing (1 hero + 6 grid = MIN_HOME_CARDS). If
// heroPool below ever comes up empty (HERO_ELIGIBLE_TYPES too thin this batch), the grid
// grows to MIN_HOME_CARDS on its own instead of silently dropping the reader to 6 cards —
// see gridTarget below.
const GRID_SIZE = MIN_HOME_CARDS - 1;

// The Research tab specifically gets a taller grid than every other tab — PubMed's fetch
// (up to 30 fresh articles/hour, see lib/pubmed.ts DEFAULT_LIMIT) comfortably supports more
// than MIN_HOME_CARDS, and "not enough research on Home" is a real, distinct complaint from
// readers who'd already noticed Refresh existed. Every other tab (All/guidelines/industry/
// ce/product) stays at the original, tighter default on purpose — Guidelines only has 8 real
// CPGs total, ever, and CE & Events has no live source at all, so a bigger floor there would
// just mean more "Nothing with a picture in this category yet" instead of more real content.
// gridArticles below already shows fewer than its target rather than ever repeating a
// picture, so this is a safe ceiling to raise — a thin batch just falls short of it.
const RESEARCH_GRID_SIZE = 14;

// The hero is the single most prominent thing on Home, so it's held to a tighter bar than
// the grid below it: only genuinely medical sources — PubMed research and the curated AOPT
// clinical practice guidelines (see lib/orthopt-cpg-static.ts) — never Google-News-sourced
// industry/equipment coverage (see lib/news-live.ts), even when the type filter tab is set
// to "All". The grid isn't restricted this way; this only narrows heroPool below.
const HERO_ELIGIBLE_TYPES: ArticleType[] = ["research", "guideline"];

const TYPE_TABS: { id: ArticleType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "research", label: "Research" },
  { id: "guideline", label: "Guidelines" },
  { id: "industry", label: "Industry & Policy" },
  { id: "ce", label: "CE & Events" },
  { id: "product", label: "Equipment" },
];

export function HomeFeed({
  articles,
  calendarWidget,
  stocks,
  license,
  savedUnread,
  nexusSuggestions,
  nexusOnWaitlist,
  continueReading,
  homeQuestion,
  dashboard,
  foundingFunderNumber,
  hiddenWidgets,
  limbicAgentInsights,
  isPro,
  gridSeenFingerprints,
  showBackupSigninBanner,
  showMigrationReminderBanner,
  showGraduationTransitionCard,
  getTheAppDismissed,
}: {
  articles: DecoratedArticle[];
  /** Server-rendered — see components/LimbicCalendarWidget.tsx, app/(app)/page.tsx. */
  calendarWidget: ReactNode;
  stocks: StockView[];
  license: LicenseView | null;
  savedUnread: DecoratedArticle[];
  /** null when the viewer hasn't opted into Nexus yet — renders an invitation instead of
   *  a list of people they can't act on. */
  nexusSuggestions: NexusSuggestion[] | null;
  /** True when the reader has opted into Nexus but nexusSuggestions is still null because
   *  Nexus itself is coming-soon for non-admins (see app/(app)/nexus/layout.tsx) — shows a
   *  waitlist confirmation instead of asking them to join again. Always false once real
   *  suggestions are being shown. */
  nexusOnWaitlist: boolean;
  /** null when there's no reading history yet — see app/(app)/page.tsx. */
  continueReading: ContinueReadingData | null;
  homeQuestion: HomeQuestionData;
  dashboard: DailyDashboardData;
  /** null when the reader isn't a confirmed Founding Funder, or has turned their badge off
   *  (see components/FoundingFunderBadgeCard.tsx on Profile) — otherwise the number shown
   *  next to the greeting, linking out to /founding-funders. */
  foundingFunderNumber: number | null;
  /** Sidebar widget ids the reader has hidden — see lib/home-widgets.ts and the "Home page
   *  widgets" section on Profile. */
  hiddenWidgets: string[];
  limbicAgentInsights: LimbicAgentInsights;
  isPro: boolean;
  /** Title fingerprints (see lib/home-grid-rotation.ts titleFingerprint) of articles the
   *  grid has already shown this reader since their last Refresh click — see
   *  app/actions/home.ts refreshHomeFeedAction. */
  gridSeenFingerprints: string[];
  /** One-time — see lib/session.ts hasBackupSigninFlag. */
  showBackupSigninBanner: boolean;
  /** Student tier, no backup email, already sent the reminder, not dismissed this session
   *  — see app/(app)/page.tsx and app/actions/account-migration.ts hasMigrationBannerDismissed. */
  showMigrationReminderBanner: boolean;
  /** Student tier, graduationDate passed, not shown (or snoozed 7+ days ago) — see
   *  app/(app)/page.tsx. */
  showGraduationTransitionCard: boolean;
  /** Hides the "Get the app" shortcut icon next to Refresh once the reader's dismissed that
   *  card on Profile (see components/GetTheAppCard.tsx) — no point linking to instructions
   *  they've already said they don't need. */
  getTheAppDismissed: boolean;
}) {
  const showWidget = (id: string) => !hiddenWidgets.includes(id);
  const [filter, setFilter] = useState<ArticleType | "all">("all");

  // Set by clicking a gap-topic row on the Limbic Agent card (see LimbicAgentCard.tsx,
  // which links to /home?topic=<slug>) — pre-filters the feed to that topic on arrival. Read
  // straight from the URL (not local state initialized once) so clicking a *different*
  // gap-topic row while already on Home updates the filter too, not just the first visit.
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic");
  const clearTopicFilter = () => router.replace(pathname);

  // Keeps the "tz" cookie lib/timezone.ts reads (server-side, for the greeting's time-of-day
  // copy above) in sync with the browser's actual IANA zone — a cookie rather than
  // localStorage specifically because this needs to be readable during SSR, which
  // localStorage never is. A no-op once it's already correct, so this only ever
  // router.refresh()es on a brand-new browser (no cookie yet) or an actual zone change
  // (e.g. travel, DST edge cases) — not on every ordinary Home visit. Mounted here rather
  // than somewhere shared across every page since the greeting is the only thing that reads
  // it, and /home is reliably the first page any signed-in session lands on.
  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const stored = document.cookie.match(/(?:^|;\s*)tz=([^;]*)/)?.[1];
    if (stored === encodeURIComponent(zone)) return;
    document.cookie = `tz=${encodeURIComponent(zone)}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
    // Deliberately mount-only — router's identity is stable across renders anyway, and this
    // isn't meant to re-run on route changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The URL only carries the slug (e.g. "back-pain") — this recovers the real-cased label
  // ("Back Pain") to show in the pill by finding whichever tag/specialty among the current
  // articles actually slugifies to it, falling back to a best-effort de-slugify (title
  // case, hyphens back to spaces) on the off chance nothing in this batch matches.
  const topicDisplayLabel = useMemo(() => {
    if (!topicParam) return null;
    for (const a of articles) {
      const match = [...a.tags, a.specialtyLabel].find((t) => slugifyTopic(t) === topicParam);
      if (match) return match;
    }
    return topicParam
      .split("-")
      .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");
  }, [articles, topicParam]);

  const filtered = useMemo(() => {
    const byType = filter === "all" ? articles : articles.filter((a) => a.type === filter);
    if (!topicParam) return byType;
    return byType.filter(
      (a) => a.tags.some((t) => slugifyTopic(t) === topicParam) || slugifyTopic(a.specialtyLabel) === topicParam
    );
  }, [articles, filter, topicParam]);

  // Every visible card needs a real picture — no more falling back to a blank card just
  // to hit a count (see page.tsx's resolveHomeImages, which searches deeper into the
  // ranked pool specifically so this doesn't come up short).
  const withImage = useMemo(() => filtered.filter((a) => a.image), [filtered]);

  // The hero picks first — top of rank, restricted to HERO_ELIGIBLE_TYPES — precisely so
  // it isn't starved by the grid below greedily claiming the same top-ranked research/
  // guideline articles first (rank order and "is a medical source" correlate heavily,
  // since evidence quality feeds into ranking). Deduped by image as it's built (not just
  // filtered/sliced) so the rotation itself never lands on two entries sharing a picture —
  // a reader flipping from the first hero card to the second must never see the same photo
  // twice in a row. Every picture in this pool is also off-limits to the grid below (see
  // heroImages/gridArticles) — the hero rotates through all of them, not just whichever one
  // happens to be showing right now, so a reader must never see a grid card repeat any
  // picture the hero could be displaying at that moment either.
  const rawHeroPool = useMemo(() => {
    const seenImages = new Set<string>();
    const pool: DecoratedArticle[] = [];
    for (const a of withImage) {
      if (!HERO_ELIGIBLE_TYPES.includes(a.type)) continue;
      if (!a.image || seenImages.has(a.image)) continue;
      seenImages.add(a.image);
      pool.push(a);
      if (pool.length >= HERO_SIZE) break;
    }
    return pool;
  }, [withImage]);

  // RefreshHomeFeedButton is meant to only change the grid, never the hero — but switching
  // the type tab or arriving via a different Limbic Agent gap-topic link (LimbicAgentCard.tsx)
  // is a genuine "show me something else" request and should still update it. This pins
  // rawHeroPool per (filter, topicParam): setting state directly during render — React's
  // documented pattern for "adjusting state when a prop changes" — re-pins the moment the
  // key itself changes, but a refresh alone (articles changes, filter/topicParam don't)
  // never re-enters that branch, so pinnedHeroPool stays exactly what it was.
  const heroPinKey = `${filter}:${topicParam ?? ""}`;
  const [pinnedHeroKey, setPinnedHeroKey] = useState(heroPinKey);
  const [pinnedHeroPool, setPinnedHeroPool] = useState(rawHeroPool);
  if (heroPinKey !== pinnedHeroKey) {
    setPinnedHeroKey(heroPinKey);
    setPinnedHeroPool(rawHeroPool);
  }
  // Falls back to the fresh pool on the rare batch where the very first pin for this key
  // came up empty (no eligible research/guideline articles yet) — pinnedHeroPool otherwise
  // never updates again until the key changes, so this keeps trying each refresh instead
  // of permanently showing no hero for the rest of that key's lifetime.
  const heroPool = pinnedHeroPool.length > 0 ? pinnedHeroPool : rawHeroPool;

  // Normally GRID_SIZE (1 hero + 6 grid = MIN_HOME_CARDS) — but if heroPool came up empty
  // (nothing eligible this batch — see HERO_ELIGIBLE_TYPES above), the hero block doesn't
  // render at all, so the grid grows to fill the gap itself rather than leaving the reader
  // at 6 cards instead of the guaranteed minimum. The Research tab always targets the taller
  // RESEARCH_GRID_SIZE instead, hero or not — see that constant's own comment.
  const gridTarget = filter === "research" ? RESEARCH_GRID_SIZE : heroPool.length > 0 ? GRID_SIZE : MIN_HOME_CARDS;

  // The grid's cards must have mutually distinct pictures — and distinct from every picture
  // the hero could be showing (see heroImages below) — walking in rank order and keeping the
  // first article to claim each image URL guarantees that without ever needing to drop an
  // article for "no picture available" (see withImage above) — and skipping whatever the
  // hero already claimed keeps the same story from appearing in both places at once.
  const heroIds = useMemo(() => new Set(heroPool.map((a) => a.id)), [heroPool]);
  // Every picture any article in heroPool could show — not just whichever one the hero
  // happens to be rotated to right now — so the grid never repeats a picture the hero might
  // display a few seconds later either. A reader must never see the same photo twice on
  // screen at once, full stop, so this is checked unconditionally below with no fallback
  // that allows a repeat.
  const heroImages = useMemo(() => new Set(heroPool.map((a) => a.image).filter((img): img is string => !!img)), [heroPool]);
  // Unseen-first, not a straight rank sort — so a normal visit still shows the actual
  // best-ranked set (nothing's been marked seen yet), but after a Refresh click (which
  // marks the previous grid seen — see app/actions/home.ts), the same rank-ordered walk
  // below naturally lands on different articles instead of the same deterministic top-N.
  const orderedForGrid = useMemo(
    () => orderArticlesForGrid(withImage, gridSeenFingerprints),
    [withImage, gridSeenFingerprints]
  );
  const gridArticles = useMemo(() => {
    const seenImages = new Set<string>(heroImages);
    const picked: DecoratedArticle[] = [];
    for (const a of orderedForGrid) {
      if (picked.length >= gridTarget) break;
      if (heroIds.has(a.id)) continue;
      if (!a.image || seenImages.has(a.image)) continue;
      seenImages.add(a.image);
      picked.push(a);
    }
    // gridTarget is a floor this tries to hit, but never at the cost of a repeated picture —
    // a reader seeing the same photo on two cards at once is worse than seeing one fewer
    // card, so a thin/unlucky batch that can't find gridTarget distinct images just shows
    // fewer instead of backfilling with a duplicate (the old behavior here).
    return picked;
  }, [orderedForGrid, heroIds, heroImages, gridTarget]);

  // Arriving via a gap-topic link (see LimbicAgentCard.tsx) drops the reader at the top of
  // the page same as any other Home visit — this carries them the rest of the way down to
  // where the now-filtered results actually are, past the dashboard/Limbic Agent card
  // they've already seen. Keyed on topicParam specifically (not e.g. a mount-only effect)
  // so clicking a different gap-topic row while already on Home scrolls again too.
  const feedSectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (topicParam) feedSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [topicParam]);

  // Same action + router.refresh() RefreshHomeFeedButton's onClick already does — pull-to-
  // refresh (see components/PullToRefresh.tsx) is just a second, touch-driven entry point
  // into the identical refresh, not a separate mechanism. `pending` drives the indicator's
  // "settle back down" moment for the same reason it drives the button's own spin: it only
  // flips false once the transition (server action + the router.refresh() re-render) has
  // actually committed, not on a guessed timeout.
  const [pending, startTransition] = useTransition();
  const handlePullRefresh = () => {
    const fingerprints = gridArticles.map((a) => titleFingerprint(a.title));
    startTransition(async () => {
      await refreshHomeFeedAction(fingerprints);
      router.refresh();
    });
  };

  return (
    <PullToRefresh refreshing={pending} onRefresh={handlePullRefresh}>
    <div className="home-pad page-enter">
      <div className="home-row">
        <div className="home-main-col">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h1 style={{ fontSize: 26, margin: 0 }}>{dashboard.greeting}</h1>
                {foundingFunderNumber != null && (
                  <Link href="/founding-funders" style={{ textDecoration: "none" }}>
                    <FoundingFunderBadge number={foundingFunderNumber} numberOnly />
                  </Link>
                )}
              </div>
              <div style={{ fontSize: 13, color: "var(--color-neutral-700)", marginTop: 2 }}>{dashboard.dateLabel}</div>
              {license && license.cePercent < 100 && (
                <Link
                  href="/profile"
                  className={license.statusClass}
                  style={{ display: "inline-flex", marginTop: 8, textDecoration: "none" }}
                >
                  {license.daysLeftLabel} · {license.ceRequiredTotal - license.ceCompletedTotal} hrs CE left
                </Link>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <RefreshHomeFeedButton gridArticleFingerprints={gridArticles.map((a) => titleFingerprint(a.title))} />
              {!getTheAppDismissed && (
                <Link
                  href="/profile#get-the-app"
                  className="btn btn-secondary btn-icon"
                  aria-label="Get the app"
                  title="Add Limbic to your home screen"
                >
                  <DownloadIcon size={16} />
                </Link>
              )}
              <Link href="/search" className="btn btn-secondary btn-icon" aria-label="Search">
                <SearchIcon size={17} />
              </Link>
            </div>
          </div>

          {showBackupSigninBanner && <BackupSigninBanner />}
          {showGraduationTransitionCard && <GraduationTransitionCard />}
          {showMigrationReminderBanner && <MigrationReminderBanner />}

          <div style={{ marginBottom: 20 }} data-tour="daily-dashboard">
            <DailyDashboard data={dashboard} />
          </div>

          <div style={{ marginBottom: 20 }} data-tour="limbic-agent">
            <LimbicAgentCard insights={limbicAgentInsights} isPro={isPro} />
          </div>

          <div ref={feedSectionRef} style={{ marginBottom: 20, scrollMarginTop: 90 }}>
            {topicParam && topicDisplayLabel && (
              <div className="topic-filter-pill">
                <span>
                  Showing results for: <strong>{topicDisplayLabel}</strong>
                </span>
                <button type="button" aria-label="Clear topic filter" onClick={clearTopicFilter}>
                  <XIcon size={10} />
                </button>
              </div>
            )}
            <SlidingTabs tabs={TYPE_TABS} active={filter} onChange={setFilter} />
          </div>

          {heroPool.length === 0 && gridArticles.length === 0 && (
            <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>
              {filtered.length === 0
                ? "No stories in this category yet."
                : "Nothing with a picture in this category yet, try refreshing."}
            </p>
          )}

          {heroPool.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <HeroFeed articles={heroPool} />
            </div>
          )}
          <div className="cards-grid home-cards-grid" data-tour="home-feed">
            {gridArticles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>

          <div className="home-refresh-pill-wrap">
            <button type="button" className="home-refresh-pill" disabled={pending} onClick={handlePullRefresh}>
              <RefreshIcon size={13} style={pending ? { animation: "spin 0.8s linear infinite" } : undefined} />
              {pending ? "Refreshing…" : "Refresh for more"}
            </button>
          </div>
        </div>

        <aside className="home-aside-col">
          <div className="home-aside-scroll">
            {showWidget("continueReading") && <ContinueReadingCard data={continueReading} />}
            {showWidget("homeQuestion") && <HomeQuestionCard data={homeQuestion} />}
            {showWidget("savedUnread") && <SavedUnreadCard articles={savedUnread} />}
            {showWidget("calendar") && calendarWidget}
            {showWidget("nexus") &&
              (nexusSuggestions ? (
                <NexusSuggestionsCard people={nexusSuggestions} />
              ) : (
                <NexusJoinPromptCard onWaitlist={nexusOnWaitlist} />
              ))}
            {showWidget("stock") && <StockCard stocks={stocks} />}
          </div>
        </aside>
      </div>
    </div>
    </PullToRefresh>
  );
}
