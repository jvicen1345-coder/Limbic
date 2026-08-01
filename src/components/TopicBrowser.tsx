"use client";

import { useMemo, useState } from "react";
import { TopicChip } from "@/components/TopicChip";

/** Search-to-filter list for the long tail of keyword-derived topics — the ones too
 *  specific (or too numerous) to show all at once under "Suggested". */
export function TopicBrowser({ topics, followedTopics }: { topics: string[]; followedTopics: string[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter((t) => t.toLowerCase().includes(q));
  }, [topics, query]);

  return (
    <div>
      <div className="field">
        <input
          className="input"
          type="text"
          placeholder="Search topics to add…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search topics to add"
        />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, maxHeight: 200, overflowY: "auto" }}>
        {filtered.length > 0 ? (
          filtered.map((t) => <TopicChip key={t} topic={t} followed={followedTopics.includes(t)} />)
        ) : (
          <p style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: 0 }}>
            No topics match &ldquo;{query}&rdquo;.
          </p>
        )}
      </div>
    </div>
  );
}
