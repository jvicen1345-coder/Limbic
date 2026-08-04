"use client";

import { useMemo, useState } from "react";
import { Chip } from "@/components/Chip";
import { ArticleCard } from "@/components/ArticleCard";
import { Pagination } from "@/components/Pagination";
import { aiPubmedSearchAction, type AiSearchResult } from "@/app/actions/ai-search";
import { paginate } from "@/lib/pagination";
import type { DecoratedArticle } from "@/lib/feed";
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
        Describe what you&rsquo;re looking for in plain language — it&rsquo;ll be turned into a PubMed
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
          Couldn&rsquo;t reach the search assistant just now — try again in a moment.
        </p>
      )}
    </div>
  );
}

export function SearchScreen({
  articles,
  initialType = "all",
  initialQuery = "",
  initialNewOnly = false,
  todayStr,
}: {
  articles: DecoratedArticle[];
  initialType?: ArticleType | "all";
  initialQuery?: string;
  /** True when arriving from the Home dashboard's Studies/Guidelines tile (via
   *  /search?new=1) — starts the results filtered down to just today's new items,
   *  matching the count shown on that tile (see components/DailyDashboard.tsx). */
  initialNewOnly?: boolean;
  /** The same server-local "today" the dashboard tile counts were computed against (see
   *  lib/today.ts) — required whenever initialNewOnly can be true. */
  todayStr?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<ArticleType | "all">(initialType);
  const [specialty, setSpecialty] = useState<Specialty | "all">("all");
  const [newOnly, setNewOnly] = useState(initialNewOnly);
  const [page, setPage] = useState(1);
  const [aiResult, setAiResult] = useState<AiSearchResult | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = articles.filter((a) => {
      if (type !== "all" && a.type !== type) return false;
      if (specialty !== "all" && a.specialty !== specialty) return false;
      if (newOnly && a.date !== todayStr) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.source.toLowerCase().includes(q)
      );
    });
    list = list.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [articles, query, type, specialty, newOnly, todayStr]);

  const { pageItems, totalPages, page: clampedPage } = useMemo(() => paginate(results, page), [results, page]);

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
              No PubMed results for that description — try rephrasing it.
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
                Showing only what&rsquo;s new today — {results.length} {results.length === 1 ? "item" : "items"}
              </span>
              <button type="button" className="btn btn-ghost" onClick={() => setNewOnly(false)}>
                Show all
              </button>
            </div>
          )}

          <div className="field" style={{ marginBottom: 16 }}>
            <input
              className="input"
              placeholder="Search articles, topics, sources…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-700)", marginBottom: 8 }}>
            Type
          </div>
          <div className="filter-row" style={{ marginBottom: 14 }}>
            {TYPE_TABS.map((t) => (
              <Chip
                key={t.id}
                active={type === t.id}
                onClick={() => {
                  setType(t.id);
                  setPage(1);
                }}
              >
                {t.label}
              </Chip>
            ))}
          </div>

          <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-700)", marginBottom: 8 }}>
            Specialty
          </div>
          <div className="filter-row" style={{ marginBottom: 18 }}>
            {SPECIALTY_TABS.map((t) => (
              <Chip
                key={t.id}
                active={specialty === t.id}
                onClick={() => {
                  setSpecialty(t.id);
                  setPage(1);
                }}
              >
                {t.label}
              </Chip>
            ))}
          </div>

          <div style={{ fontSize: 13, color: "var(--color-neutral-700)", marginBottom: 10 }}>
            {results.length} {results.length === 1 ? "result" : "results"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pageItems.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
          <Pagination page={clampedPage} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
