"use client";

import { useMemo, useState } from "react";
import { Chip } from "@/components/Chip";
import { ArticleCard } from "@/components/ArticleCard";
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

export function SearchScreen({ articles }: { articles: DecoratedArticle[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<ArticleType | "all">("all");
  const [specialty, setSpecialty] = useState<Specialty | "all">("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = articles.filter((a) => {
      if (type !== "all" && a.type !== type) return false;
      if (specialty !== "all" && a.specialty !== specialty) return false;
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
  }, [articles, query, type, specialty]);

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 16px" }}>Search</h1>
      <div className="field" style={{ marginBottom: 16 }}>
        <input
          className="input"
          placeholder="Search articles, topics, sources…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-700)", marginBottom: 8 }}>
        Type
      </div>
      <div className="filter-row" style={{ marginBottom: 14 }}>
        {TYPE_TABS.map((t) => (
          <Chip key={t.id} active={type === t.id} onClick={() => setType(t.id)}>
            {t.label}
          </Chip>
        ))}
      </div>

      <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-700)", marginBottom: 8 }}>
        Specialty
      </div>
      <div className="filter-row" style={{ marginBottom: 18 }}>
        {SPECIALTY_TABS.map((t) => (
          <Chip key={t.id} active={specialty === t.id} onClick={() => setSpecialty(t.id)}>
            {t.label}
          </Chip>
        ))}
      </div>

      <div style={{ fontSize: 13, color: "var(--color-neutral-700)", marginBottom: 10 }}>
        {results.length} {results.length === 1 ? "result" : "results"}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {results.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </div>
  );
}
