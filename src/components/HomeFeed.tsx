"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, XIcon } from "@/components/icons";
import { slugifyTopic } from "@/lib/topic-slug";
import { SlidingTabs } from "@/components/SlidingTabs";
import { ArticleCard } from "@/components/ArticleCard";
import { HeroFeed } from "@/components/HeroFeed";
import { CalendarCard, type CeEvent } from "@/components/CalendarCard";
import { ContinueReadingCard, type ContinueReadingData } from "@/components/ContinueReadingCard";
import { DailyDashboard, type DailyDashboardData } from "@/components/DailyDashboard";
import { LimbicAgentCard } from "@/components/LimbicAgentCard";
import { RefreshHomeFeedButton } from "@/components/RefreshHomeFeedButton";
import { StockCard } from "@/components/StockCard";
import { RevolvingNews } from "@/components/RevolvingNews";
import { SavedUnreadCard } from "@/components/SavedUnreadCard";
import { NexusSuggestionsCard, type NexusSuggestion } from "@/components/NexusSuggestionsCard";
import { NexusJoinPromptCard } from "@/components/NexusJoinPromptCard";
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
  ceEvents,
  stocks,
  newsTicker,
  license,
  savedUnread,
  nexusSuggestions,
  continueReading,
  dashboard,
  hiddenWidgets,
  limbicAgentInsights,
  isPro,
}: {
  articles: DecoratedArticle[];
  ceEvents: CeEvent[];
  stocks: StockView[];
  newsTicker: DecoratedArticle[];
  license: LicenseView | null;
  savedUnread: DecoratedArticle[];
  /** null when the viewer hasn't opted into Nexus yet — renders an invitation instead of
   *  a list of people they can't act on. */
  nexusSuggestions: NexusSuggestion[] | null;
  /** null when there's no reading history yet — see app/(app)/page.tsx. */
  continueReading: ContinueReadingData | null;
  dashboard: DailyDashboardData;
  /** Sidebar widget ids the reader has hidden — see lib/home-widgets.ts and the "Home page
   *  widgets" section on Profile. */
  hiddenWidgets: string[];
  limbicAgentInsights: LimbicAgentInsights;
  isPro: boolean;
}) {
  const showWidget = (id: string) => !hiddenWidgets.includes(id);
  const [filter, setFilter] = useState<ArticleType | "all">("all");

  // Set by clicking a gap-topic row on the Limbic Agent card (see LimbicAgentCard.tsx,
  // which links to /?topic=<slug>) — pre-filters the feed to that topic on arrival. Read
  // straight from the URL (not local state initialized once) so clicking a *different*
  // gap-topic row while already on Home updates the filter too, not just the first visit.
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic");
  const clearTopicFilter = () => router.replace(pathname);

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

  // The news ticker's own articles are excluded from both the hero and the grid, so the
  // same story can't show up twice on screen at once.
  const newsIds = useMemo(() => new Set(newsTicker.map((a) => a.id)), [newsTicker]);
  const withoutNews = useMemo(() => withImage.filter((a) => !newsIds.has(a.id)), [withImage, newsIds]);

  // The hero picks first — top of rank, restricted to HERO_ELIGIBLE_TYPES — precisely so
  // it isn't starved by the grid below greedily claiming the same top-ranked research/
  // guideline articles first (rank order and "is a medical source" correlate heavily,
  // since evidence quality feeds into ranking). Its picture is allowed to repeat one the
  // grid ends up using too; the reader explicitly doesn't mind that repetition.
  const rawHeroPool = useMemo(
    () => withoutNews.filter((a) => HERO_ELIGIBLE_TYPES.includes(a.type)).slice(0, HERO_SIZE),
    [withoutNews]
  );

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
  // at 6 cards instead of the guaranteed minimum.
  const gridTarget = heroPool.length > 0 ? GRID_SIZE : MIN_HOME_CARDS;

  // The grid's cards must have mutually distinct pictures; walking in rank order and
  // keeping the first article to claim each image URL guarantees that without ever needing
  // to drop an article for "no picture available" (see withImage above) — and skipping
  // whatever the hero already claimed keeps the same story from appearing in both places
  // at once.
  const heroIds = useMemo(() => new Set(heroPool.map((a) => a.id)), [heroPool]);
  const gridArticles = useMemo(() => {
    const seenImages = new Set<string>();
    const pickedIds = new Set<string>();
    const picked: DecoratedArticle[] = [];
    for (const a of withoutNews) {
      if (picked.length >= gridTarget) break;
      if (heroIds.has(a.id)) continue;
      if (!a.image || seenImages.has(a.image)) continue;
      seenImages.add(a.image);
      pickedIds.add(a.id);
      picked.push(a);
    }
    // gridTarget is a hard floor, not a best-effort target — distinct images are the ideal
    // (the loop above), but a thin/unlucky batch that can't find gridTarget distinct ones
    // must still hit the floor, so this backfills from whatever's left (still never the
    // hero, never already-picked) allowing an image repeat rather than showing fewer cards
    // than guaranteed.
    if (picked.length < gridTarget) {
      for (const a of withoutNews) {
        if (picked.length >= gridTarget) break;
        if (heroIds.has(a.id) || pickedIds.has(a.id) || !a.image) continue;
        pickedIds.add(a.id);
        picked.push(a);
      }
    }
    return picked;
  }, [withoutNews, heroIds, gridTarget]);

  // Arriving via a gap-topic link (see LimbicAgentCard.tsx) drops the reader at the top of
  // the page same as any other Home visit — this carries them the rest of the way down to
  // where the now-filtered results actually are, past the dashboard/Limbic Agent card
  // they've already seen. Keyed on topicParam specifically (not e.g. a mount-only effect)
  // so clicking a different gap-topic row while already on Home scrolls again too.
  const feedSectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (topicParam) feedSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [topicParam]);

  return (
    <div className="home-pad">
      <div className="home-row">
        <div className="home-main-col">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
            <div>
              <h1 style={{ fontSize: 26, margin: 0 }}>{dashboard.greeting}</h1>
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
              <RefreshHomeFeedButton />
              <Link href="/search" className="btn btn-secondary btn-icon" aria-label="Search">
                <SearchIcon size={17} />
              </Link>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <DailyDashboard data={dashboard} />
          </div>

          <div style={{ marginBottom: 20 }}>
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
                : "Nothing with a picture in this category yet — try refreshing."}
            </p>
          )}

          {heroPool.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <HeroFeed articles={heroPool} />
              {/* Mobile keeps "Latest news" right under the hero (its counterpart in the
               *  aside below is desktop-only — see .home-news-desktop/.home-hero-news-mobile
               *  in globals.css); on desktop the aside's sidebar copy is the one that shows. */}
              {showWidget("news") && newsTicker.length > 0 && (
                <div className="home-hero-news-mobile" style={{ marginTop: 8 }}>
                  <RevolvingNews articles={newsTicker} />
                </div>
              )}
            </div>
          )}
          <div className="cards-grid home-cards-grid">
            {gridArticles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>

        <aside className="home-aside-col">
          <div className="home-aside-scroll">
            {showWidget("continueReading") && <ContinueReadingCard data={continueReading} />}
            {showWidget("savedUnread") && <SavedUnreadCard articles={savedUnread} />}
            {showWidget("calendar") && <CalendarCard events={ceEvents} />}
            {showWidget("nexus") &&
              (nexusSuggestions ? <NexusSuggestionsCard people={nexusSuggestions} /> : <NexusJoinPromptCard />)}
            {showWidget("stock") && <StockCard stocks={stocks} />}
            {showWidget("news") && (
              <div className="home-news-desktop">
                <RevolvingNews articles={newsTicker} />
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
