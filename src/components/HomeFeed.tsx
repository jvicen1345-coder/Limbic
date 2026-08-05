"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import { Chip } from "@/components/Chip";
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
import { Pagination } from "@/components/Pagination";
import { paginate } from "@/lib/pagination";
import type { DecoratedArticle } from "@/lib/feed";
import type { ArticleType } from "@/lib/types";
import type { StockView } from "@/lib/stock";
import type { LicenseView } from "@/lib/license";
import type { LimbicAgentInsights } from "@/lib/limbic-agent-insights";

// How many of the top-ranked articles the hero rotates through — kept well under
// page.tsx's FEED_IMAGE_LIMIT so there's still a meaningful pool of imaged articles left
// for the grid below.
const HERO_SIZE = 5;

// Page 1 shows the hero (1 visible card, even though it rotates through HERO_SIZE
// candidates) plus this many grid cards below it — 7 total, matching how many distinct
// cards should be on screen at once.
const GRID_PAGE_SIZE = 6;

// How many of the grid's top-ranked candidates are eligible to shuffle into page 1 on a
// refresh (see refreshSeed below) — wide enough that a refresh visibly changes which
// GRID_PAGE_SIZE articles show, without reaching so far into the ranked tail that
// clicking Refresh could surface something far less relevant than the reader's top
// stories. Articles beyond this window (page 2 onward) are untouched by shuffling.
const GRID_SHUFFLE_WINDOW = 24;

// mulberry32 — a tiny, dependency-free seeded PRNG. Same seed always produces the same
// shuffle order, so this only reshuffles when refreshSeed itself changes (a fresh server
// render — see refreshSeed below), not on every re-render from unrelated local state
// (switching filter tabs, paging).
function seededShuffle<T>(items: T[], seed: number): T[] {
  let s = (seed * 2 ** 31) >>> 0 || 1;
  const next = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const shuffled = items.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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
  refreshSeed,
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
  /** A fresh value on every server render (see app/(app)/page.tsx) — the initial load, or
   *  a click of RefreshHomeFeedButton (app/actions/home.ts's router.refresh() re-runs the
   *  page). rankFeed's ordering is a deterministic sort, so without this, refreshing would
   *  keep re-showing the identical top-ranked grid whenever the underlying article pool
   *  hadn't itself changed between requests — this is what makes Refresh visibly change
   *  the cards under the hero, by reshuffling which of the top-ranked candidates land in
   *  the grid (see GRID_SHUFFLE_WINDOW below). */
  refreshSeed: number;
}) {
  const showWidget = (id: string) => !hiddenWidgets.includes(id);
  const [filter, setFilter] = useState<ArticleType | "all">("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => (filter === "all" ? articles : articles.filter((a) => a.type === filter)),
    [articles, filter]
  );

  // Home always wants a minimum of 7 cards on page 1 (the hero's one visible slot + up to
  // GRID_PAGE_SIZE below it), so unlike an earlier version of this logic, articles are
  // never dropped just for lacking a picture or sharing one — that would shrink the pool
  // below 7 whenever too few articles resolved a distinct image (see page.tsx's
  // FEED_IMAGE_LIMIT and lib/topic-image.ts — most seed/guideline-PDF content has no
  // og:image to find at all). Reusing the same photo across different page loads is fine
  // (lib/topic-image.ts matches by specialty/topic, so unrelated articles can land on the
  // same stock photo), but two cards showing the identical picture on screen at once reads
  // as a glitch — so instead of dropping the article, only the duplicate *image* is
  // stripped from every occurrence after the first, so the article still counts toward
  // filling out the feed, just without a picture, same as any article that never had one.
  const displayPool = useMemo(() => {
    const seenImages = new Set<string>();
    return filtered.map((a) => {
      if (!a.image) return a;
      if (seenImages.has(a.image)) return { ...a, image: undefined };
      seenImages.add(a.image);
      return a;
    });
  }, [filtered]);

  // The hero rotates through the top of the ranked feed instead of pinning just the single
  // top story; the news ticker's own articles are excluded from that rotation (and from the
  // grid below) so the same story can't show up twice on screen at once.
  const newsIds = useMemo(() => new Set(newsTicker.map((a) => a.id)), [newsTicker]);
  const heroPool = useMemo(
    () => displayPool.filter((a) => !newsIds.has(a.id)).slice(0, HERO_SIZE),
    [displayPool, newsIds]
  );
  const heroIds = useMemo(() => new Set(heroPool.map((a) => a.id)), [heroPool]);
  // Only shown on page 1 — it isn't part of the paginated count, same as Search doesn't
  // re-count what's already visible elsewhere.
  const rest = useMemo(() => {
    const pool = displayPool.filter((a) => !heroIds.has(a.id) && !newsIds.has(a.id));
    const shuffleWindow = seededShuffle(pool.slice(0, GRID_SHUFFLE_WINDOW), refreshSeed);
    return [...shuffleWindow, ...pool.slice(GRID_SHUFFLE_WINDOW)];
  }, [displayPool, heroIds, newsIds, refreshSeed]);
  const { pageItems, totalPages, page: clampedPage } = useMemo(
    () => paginate(rest, page, GRID_PAGE_SIZE),
    [rest, page]
  );

  const changeFilter = (id: ArticleType | "all") => {
    setFilter(id);
    setPage(1);
  };

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

          <div className="filter-row" style={{ marginBottom: 20 }}>
            {TYPE_TABS.map((t) => (
              <Chip key={t.id} active={filter === t.id} onClick={() => changeFilter(t.id)}>
                {t.label}
              </Chip>
            ))}
          </div>

          {filtered.length === 0 && (
            <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>No stories in this category yet.</p>
          )}

          {heroPool.length > 0 && clampedPage === 1 && (
            <div style={{ marginBottom: 8 }}>
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
          <div className="cards-grid">
            {pageItems.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
          <Pagination page={clampedPage} totalPages={totalPages} onPageChange={setPage} />
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
