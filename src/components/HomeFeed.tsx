"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import { Chip } from "@/components/Chip";
import { ArticleCard, HeroArticleCard } from "@/components/ArticleCard";
import { CalendarCard, type CeEvent } from "@/components/CalendarCard";
import { ContinueReadingCard, type ContinueReadingData } from "@/components/ContinueReadingCard";
import { DailyDashboard, type DailyDashboardData } from "@/components/DailyDashboard";
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
}) {
  const [filter, setFilter] = useState<ArticleType | "all">("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => (filter === "all" ? articles : articles.filter((a) => a.type === filter)),
    [articles, filter]
  );
  // The hero is always the top story and only shown on page 1 — it isn't part of the
  // paginated count, same as Search doesn't re-count what's already visible elsewhere.
  const hero = filtered[0];
  const rest = filtered.slice(1);
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
            <Link href="/search" className="btn btn-secondary btn-icon" aria-label="Search">
              <SearchIcon size={17} />
            </Link>
          </div>

          <div style={{ marginBottom: 20 }}>
            <DailyDashboard data={dashboard} />
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

          {hero && clampedPage === 1 && (
            <div style={{ marginBottom: 8 }}>
              <HeroArticleCard article={hero} />
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
            <ContinueReadingCard data={continueReading} />
            <SavedUnreadCard articles={savedUnread} />
            <CalendarCard events={ceEvents} />
            {nexusSuggestions ? <NexusSuggestionsCard people={nexusSuggestions} /> : <NexusJoinPromptCard />}
            <StockCard stock={stock} />
            <RevolvingNews articles={newsTicker} />
          </div>
        </aside>
      </div>
    </div>
  );
}
