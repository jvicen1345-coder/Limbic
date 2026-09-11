"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Chip } from "@/components/Chip";
import { ArticleCard, type ArticleCardModel } from "@/components/ArticleCard";
import { Pagination } from "@/components/Pagination";
import { SearchIcon, RefreshIcon } from "@/components/icons";
import { aiPubmedSearchAction, type AiSearchResult } from "@/app/actions/ai-search";
import { searchArticlesHref, type SearchSpecialtyFilter, type SearchTypeFilter } from "@/lib/search-articles";
import type { ArticleType, Specialty } from "@/lib/types";

const TYPE_TABS: { id: ArticleType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "research", label: "Research" },
  { id: "guideline", label: "Guidelines" },
  { id: "industry", label: "Industry & Policy" },
  { id: "ce", label: "CE & Events" },
  { id: "product", label: "Equipment" },
];

const SPECIALTY_TABS: { id: Specialty | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ortho", label: "Orthopedic" },
  { id: "neuro", label: "Neurologic" },
  { id: "sports", label: "Sports" },
  { id: "pediatric", label: "Pediatric" },
  { id: "geriatric", label: "Geriatric" },
];

function AiPubmedSearch({ onResult }: { onResult: (result: AiSearchResult | null) => void }) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function run() {
    const trimmed = description.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(false);
    try {
      const result = await aiPubmedSearchAction(trimmed);
      onResult(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card elev-sm" style={{ marginBottom: 18 }}>
      <div className="card-kicker">Ask AI to search PubMed</div>
      <p className="card-body" style={{ marginTop: 2 }}>
        Describe what you&rsquo;re looking for in plain language, it&rsquo;ll be turned into a PubMed
        search for you.
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input
          className="input"
          placeholder="e.g. blood-flow restriction training after ACL repair"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") run();
          }}
        />
        <button type="button" className="btn btn-primary" disabled={loading || !description.trim()} onClick={run}>
          {loading ? "Searching…" : "Search"}
        </button>
      </div>
      {error && (
        <p style={{ fontSize: 12, color: "var(--color-neutral-700)", marginTop: 8 }}>
          Couldn&rsquo;t reach the search assistant just now, try again in a moment.
        </p>
      )}
    </div>
  );
}

export function SearchScreen({
  articles,
  resultCount,
  page,
  totalPages,
  initialType = "all",
  initialSpecialty = "all",
  initialQuery = "",
  initialNewOnly = false,
}: {
  articles: ArticleCardModel[];
  resultCount: number;
  page: number;
  totalPages: number;
  initialType?: SearchTypeFilter;
  /** Pre-selects the Specialty chip — set via /search?specialty=... (see
   *  lib/threads.ts's per-article-type node links, the first caller of this). */
  initialSpecialty?: SearchSpecialtyFilter;
  initialQuery?: string;
  /** True when arriving from the Home dashboard's Studies/Guidelines tile (via
   *  /search?new=1) — starts the results filtered down to just today's new items,
   *  matching the count shown on that tile (see components/DailyDashboard.tsx). */
  initialNewOnly?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<SearchTypeFilter>(initialType);
  const [specialty, setSpecialty] = useState<SearchSpecialtyFilter>(initialSpecialty);
  const [newOnly, setNewOnly] = useState(initialNewOnly);
  const [aiResult, setAiResult] = useState<AiSearchResult | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);
  useEffect(() => {
    setType(initialType);
  }, [initialType]);
  useEffect(() => {
    setSpecialty(initialSpecialty);
  }, [initialSpecialty]);
  useEffect(() => {
    setNewOnly(initialNewOnly);
  }, [initialNewOnly]);

  function navigate(next: {
    type?: SearchTypeFilter;
    specialty?: SearchSpecialtyFilter;
    q?: string;
    newOnly?: boolean;
    page?: number;
  }) {
    router.replace(
      searchArticlesHref({
        type: next.type ?? type,
        specialty: next.specialty ?? specialty,
        q: next.q ?? query,
        newOnly: next.newOnly ?? newOnly,
        page: next.page ?? 1,
      })
    );
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (query.trim() === initialQuery.trim()) return;
      navigate({ q: query, page: 1 });
    }, 300);
    return () => window.clearTimeout(handle);
    // Filter chips navigate immediately; this effect only republishes `q` after the reader
    // pauses typing so each keystroke does not refetch the pool.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, initialQuery]);

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 16px" }}>Search</h1>

      <AiPubmedSearch onResult={setAiResult} />

      {aiResult ? (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
              PubMed query: <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>{aiResult.query}</span>
            </div>
            <button type="button" className="btn btn-ghost" onClick={() => setAiResult(null)}>
              Back to browse
            </button>
          </div>
          {aiResult.articles.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {aiResult.articles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>
              No PubMed results for that description, try rephrasing it.
            </p>
          )}
        </>
      ) : (
        <>
          {newOnly && (
            <div
              className="card elev-sm"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 16,
                background: "var(--color-accent-100)",
                border: "1px solid var(--color-accent-300)",
              }}
            >
              <span style={{ fontSize: 13, color: "var(--color-accent-800)" }}>
                Showing only what&rsquo;s new today, {resultCount} {resultCount === 1 ? "item" : "items"}
              </span>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setNewOnly(false);
                  navigate({ newOnly: false, page: 1 });
                }}
              >
                Show all
              </button>
            </div>
          )}

          <div className="field" style={{ marginBottom: 16 }}>
            <input
              className="input"
              placeholder="Search articles, topics, sources…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div style={{ fontSize: "var(--fs-11)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-700)", marginBottom: 8 }}>
            Type
          </div>
          <div className="filter-row" style={{ marginBottom: 14 }}>
            {TYPE_TABS.map((t) => (
              <Chip
                key={t.id}
                active={type === t.id}
                onClick={() => {
                  setType(t.id);
                  navigate({ type: t.id, page: 1 });
                }}
              >
                {t.label}
              </Chip>
            ))}
          </div>

          <div style={{ fontSize: "var(--fs-11)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-700)", marginBottom: 8 }}>
            Specialty
          </div>
          <div className="filter-row" style={{ marginBottom: 18 }}>
            {SPECIALTY_TABS.map((t) => (
              <Chip
                key={t.id}
                active={specialty === t.id}
                onClick={() => {
                  setSpecialty(t.id);
                  navigate({ specialty: t.id, page: 1 });
                }}
              >
                {t.label}
              </Chip>
            ))}
          </div>

          <div style={{ fontSize: 13, color: "var(--color-neutral-700)", marginBottom: 10 }}>
            {resultCount} {resultCount === 1 ? "result" : "results"}
          </div>

          {resultCount === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 16px", color: "var(--color-neutral-700)" }}>
              <SearchIcon size={26} style={{ color: "var(--color-neutral-400)", marginBottom: 10 }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)" }}>
                No articles found, try a different filter
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12.5,
                  marginTop: 6,
                  color: "var(--color-neutral-600)",
                }}
              >
                <RefreshIcon size={12} />
                Clearing a filter or refreshing may turn up more results
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {articles.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={(next) => navigate({ page: next })} />
            </>
          )}
        </>
      )}
    </div>
  );
}
