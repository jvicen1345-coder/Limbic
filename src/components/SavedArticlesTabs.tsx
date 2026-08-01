"use client";

import { useMemo, useState } from "react";
import { Chip } from "@/components/Chip";
import { SavedListRow, WellnessListItem } from "@/components/RowCards";
import { Pagination } from "@/components/Pagination";
import { paginate } from "@/lib/pagination";
import type { DecoratedArticle } from "@/lib/feed";
import type { WellnessArticle } from "@/lib/types";

type Tab = "articles" | "wellness";
const TABS: { id: Tab; label: string }[] = [
  { id: "articles", label: "Articles" },
  { id: "wellness", label: "Health & Wellness" },
];

export function SavedArticlesTabs({ articles, wellness }: { articles: DecoratedArticle[]; wellness: WellnessArticle[] }) {
  const [tab, setTab] = useState<Tab>("articles");
  const [page, setPage] = useState(1);

  const changeTab = (id: Tab) => {
    setTab(id);
    setPage(1);
  };

  const activeList = tab === "articles" ? articles : wellness;
  const { pageItems, totalPages, page: clampedPage } = useMemo(() => paginate(activeList, page), [activeList, page]);

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 16px" }}>Saved Articles</h1>

      <div className="filter-row" style={{ marginBottom: 20 }}>
        {TABS.map((t) => (
          <Chip key={t.id} active={tab === t.id} onClick={() => changeTab(t.id)}>
            {t.label}
          </Chip>
        ))}
      </div>

      {pageItems.length > 0 ? (
        <>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {tab === "articles"
              ? (pageItems as DecoratedArticle[]).map((a) => <SavedListRow key={a.id} article={a} badge="type" />)
              : (pageItems as WellnessArticle[]).map((w) => <WellnessListItem key={w.id} w={w} saved />)}
          </div>
          <Pagination page={clampedPage} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>
          {tab === "articles"
            ? "No saved articles yet — bookmark research, industry or CE items to see them here."
            : "No saved wellness reading yet — bookmark articles from Health & Wellness to see them here."}
        </p>
      )}
    </div>
  );
}
