"use client";

import { useMemo, useState } from "react";
import { SavedListRow } from "@/components/RowCards";
import { Pagination } from "@/components/Pagination";
import { paginate } from "@/lib/pagination";
import type { DecoratedArticle } from "@/lib/feed";

export function SavedArticlesTabs({ articles }: { articles: DecoratedArticle[] }) {
  const [page, setPage] = useState(1);
  const { pageItems, totalPages, page: clampedPage } = useMemo(() => paginate(articles, page), [articles, page]);

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 16px" }}>Saved Articles</h1>

      {pageItems.length > 0 ? (
        <>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {pageItems.map((a) => (
              <SavedListRow key={a.id} article={a} badge="type" />
            ))}
          </div>
          <Pagination page={clampedPage} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>
          No saved articles yet, bookmark research, industry or CE items to see them here.
        </p>
      )}
    </div>
  );
}
