"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import { Chip } from "@/components/Chip";
import { ArticleCard, HeroArticleCard } from "@/components/ArticleCard";
import { CalendarCard, type CeEvent } from "@/components/CalendarCard";
import { StockCard } from "@/components/StockCard";
import { RevolvingNews } from "@/components/RevolvingNews";
import type { DecoratedArticle } from "@/lib/feed";
import type { ArticleType } from "@/lib/types";
import type { StockView } from "@/lib/stock";

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
  firstName,
}: {
  articles: DecoratedArticle[];
  ceEvents: CeEvent[];
  stock: StockView;
  firstName: string;
}) {
  const [filter, setFilter] = useState<ArticleType | "all">("all");

  const filtered = useMemo(
    () => (filter === "all" ? articles : articles.filter((a) => a.type === filter)),
    [articles, filter]
  );
  const hero = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="home-pad">
      <div className="home-row">
        <div className="home-main-col">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 13, color: "var(--color-neutral-700)", marginBottom: 2 }}>Good to see you,</div>
              <h1 style={{ fontSize: 26, margin: 0 }}>{firstName}</h1>
            </div>
            <Link href="/search" className="btn btn-secondary btn-icon" aria-label="Search">
              <SearchIcon size={17} />
            </Link>
          </div>

          <div className="filter-row" style={{ marginBottom: 20 }}>
            {TYPE_TABS.map((t) => (
              <Chip key={t.id} active={filter === t.id} onClick={() => setFilter(t.id)}>
                {t.label}
              </Chip>
            ))}
          </div>

          {filtered.length === 0 && (
            <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>No stories in this category yet.</p>
          )}

          {hero && (
            <div style={{ marginBottom: 8 }}>
              <HeroArticleCard article={hero} />
            </div>
          )}
          <div className="cards-grid">
            {rest.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>

        <aside className="home-aside-col">
          <CalendarCard events={ceEvents} />
          <StockCard stock={stock} />
          <RevolvingNews articles={articles.slice(0, 6)} />
        </aside>
      </div>
    </div>
  );
}
