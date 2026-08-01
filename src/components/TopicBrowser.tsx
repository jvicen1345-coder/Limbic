"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TopicChip } from "@/components/TopicChip";

// Caps how many chips render in the dropdown at once — the full vocabulary is 100+
// topics, and typing narrows it down rather than scrolling a huge list.
const MAX_VISIBLE = 60;

/** Search-triggered dropdown for the long tail of keyword-derived topics — hidden until
 *  the search field is focused, so Profile doesn't dump 100+ chips on the page by default. */
export function TopicBrowser({ topics, followedTopics }: { topics: string[]; followedTopics: string[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? topics.filter((t) => t.toLowerCase().includes(q)) : topics;
  }, [topics, query]);
  const visible = matches.slice(0, MAX_VISIBLE);

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <div className="field">
        <input
          className="input"
          type="text"
          placeholder={`Search ${topics.length}+ topics to add…`}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          aria-label="Search topics to add"
        />
      </div>

      {open && (
        <div
          className="elev-md"
          style={{
            position: "absolute",
            zIndex: 20,
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 6,
            background: "var(--color-surface)",
            border: "1px solid var(--color-divider)",
            borderRadius: "var(--radius-lg)",
            padding: 12,
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          {visible.length > 0 ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {visible.map((t) => (
                <TopicChip key={t} topic={t} followed={followedTopics.includes(t)} />
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: 0 }}>
              No topics match &ldquo;{query}&rdquo;.
            </p>
          )}
          {matches.length > visible.length && (
            <p style={{ fontSize: 11, color: "var(--color-neutral-700)", margin: "8px 0 0" }}>
              Showing {visible.length} of {matches.length} — keep typing to narrow it down.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
