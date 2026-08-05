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
  stock,
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
  stock: StockView;
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
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => (filter === "all" ? articles : articles.filter((a) => a.type === filter)),
    [articles, filter]
  );

  // Not every article gets a picture (see page.tsx's FEED_IMAGE_LIMIT and lib/topic-image.ts
  // — most seed/guideline-PDF content has nothing to find at all), and a feed mixing imaged
  // and blank-looking cards reads as duplicates of the same empty card. So the hero rotation
  // and the grid below only draw from articles that resolved one — capping the feed to
  // however many pictures are actually available rather than padding it out with blanks.
  // Falls back to the unfiltered pool if literally none resolved an image (e.g. no
  // PEXELS_API_KEY configured), so Home never goes empty.
  const withImage = useMemo(() => filtered.filter((a) => a.image), [filtered]);
  const displayPool = withImage.length > 0 ? withImage : filtered;

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
  const rest = useMemo(
    () => displayPool.filter((a) => !heroIds.has(a.id) && !newsIds.has(a.id)),
    [displayPool, heroIds, newsIds]
  );
  const { pageItems, totalPages, page: clampedPage } = useMemo(() => paginate(rest, page), [rest, page]);

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
            {showWidget("stock") && <StockCard stock={stock} />}
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
