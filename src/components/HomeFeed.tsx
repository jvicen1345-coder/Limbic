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
import type { DecoratedArticle } from "@/lib/feed";
import type { ArticleType } from "@/lib/types";
import type { StockView } from "@/lib/stock";
import type { LicenseView } from "@/lib/license";
import type { LimbicAgentInsights } from "@/lib/limbic-agent-insights";

// How many of the top-ranked articles the hero rotates through.
const HERO_SIZE = 5;

// No pagination — Home always shows exactly the hero plus this many grid cards below it,
// 7 total. Every one of the 7 needs a real picture (see page.tsx's resolveHomeImages,
// which searches deeper into the ranked pool than a fixed slice would to make that
// realistic); RefreshHomeFeedButton is the intended way a reader waits through a
// thin/unlucky batch rather than paging past it.
const GRID_SIZE = 6;

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

  const filtered = useMemo(
    () => (filter === "all" ? articles : articles.filter((a) => a.type === filter)),
    [articles, filter]
  );

  // Every visible card needs a real picture — no more falling back to a blank card just
  // to hit a count (see page.tsx's resolveHomeImages, which searches deeper into the
  // ranked pool specifically so this doesn't come up short).
  const withImage = useMemo(() => filtered.filter((a) => a.image), [filtered]);

  // The news ticker's own articles are excluded from both the hero and the grid, so the
  // same story can't show up twice on screen at once.
  const newsIds = useMemo(() => new Set(newsTicker.map((a) => a.id)), [newsTicker]);
  const withoutNews = useMemo(() => withImage.filter((a) => !newsIds.has(a.id)), [withImage, newsIds]);

  // The grid's GRID_SIZE cards must have mutually distinct pictures; walking in rank
  // order and keeping the first article to claim each image URL guarantees that without
  // ever needing to drop an article for "no picture available" — see withImage above.
  const gridArticles = useMemo(() => {
    const seenImages = new Set<string>();
    const picked: DecoratedArticle[] = [];
    for (const a of withoutNews) {
      if (picked.length >= GRID_SIZE) break;
      if (!a.image || seenImages.has(a.image)) continue;
      seenImages.add(a.image);
      picked.push(a);
    }
    return picked;
  }, [withoutNews]);

  // The hero rotates through the top of what's left after the grid's picks — a distinct
  // *article* from every grid card (so the same story never appears in both places at
  // once), but its picture is allowed to repeat one of the grid's; the reader explicitly
  // doesn't mind that repetition for the hero specifically.
  const gridIds = useMemo(() => new Set(gridArticles.map((a) => a.id)), [gridArticles]);
  const heroPool = useMemo(
    () => withoutNews.filter((a) => !gridIds.has(a.id)).slice(0, HERO_SIZE),
    [withoutNews, gridIds]
  );

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
              <Chip key={t.id} active={filter === t.id} onClick={() => setFilter(t.id)}>
                {t.label}
              </Chip>
            ))}
          </div>

          {heroPool.length === 0 && gridArticles.length === 0 && (
            <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>
              {filtered.length === 0
                ? "No stories in this category yet."
                : "Nothing with a picture in this category yet — try refreshing."}
            </p>
          )}

          {heroPool.length > 0 && (
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
