"use client";

import { useState } from "react";

// TODO: Every category below needs 5 real, citation-worthy goal examples before launch,
// these are placeholder entries only.
const CATEGORIES: { name: string; goals: string[] }[] = [
  { name: "Mobility goals", goals: ["TODO: placeholder mobility goal 1", "TODO: placeholder mobility goal 2", "TODO: placeholder mobility goal 3", "TODO: placeholder mobility goal 4", "TODO: placeholder mobility goal 5"] },
  { name: "Strength goals", goals: ["TODO: placeholder strength goal 1", "TODO: placeholder strength goal 2", "TODO: placeholder strength goal 3", "TODO: placeholder strength goal 4", "TODO: placeholder strength goal 5"] },
  { name: "Balance goals", goals: ["TODO: placeholder balance goal 1", "TODO: placeholder balance goal 2", "TODO: placeholder balance goal 3", "TODO: placeholder balance goal 4", "TODO: placeholder balance goal 5"] },
  { name: "ADL goals", goals: ["TODO: placeholder ADL goal 1", "TODO: placeholder ADL goal 2", "TODO: placeholder ADL goal 3", "TODO: placeholder ADL goal 4", "TODO: placeholder ADL goal 5"] },
  { name: "Return to sport goals", goals: ["TODO: placeholder return-to-sport goal 1", "TODO: placeholder return-to-sport goal 2", "TODO: placeholder return-to-sport goal 3", "TODO: placeholder return-to-sport goal 4", "TODO: placeholder return-to-sport goal 5"] },
  { name: "Return to work goals", goals: ["TODO: placeholder return-to-work goal 1", "TODO: placeholder return-to-work goal 2", "TODO: placeholder return-to-work goal 3", "TODO: placeholder return-to-work goal 4", "TODO: placeholder return-to-work goal 5"] },
];

/** Not a copy template like the other six documentation cards, a searchable reference bank
 *  of pre-written goal examples organized by body region/function. */
export function FunctionalGoalsBank() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = CATEGORIES.map((cat) => ({
    ...cat,
    goals: q ? cat.goals.filter((g) => g.toLowerCase().includes(q) || cat.name.toLowerCase().includes(q)) : cat.goals,
  })).filter((cat) => cat.goals.length > 0);

  return (
    <div className="card elev-sm">
      <div className="pro-calc-title">Functional Goals Bank</div>
      <p className="pro-calc-desc">Searchable reference bank of pre-written goal examples, organized by body region and function.</p>
      <input
        className="input"
        style={{ marginTop: 10, marginBottom: 12 }}
        placeholder="Search goals..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.map((cat) => (
          <div key={cat.name}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{cat.name}</div>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 3 }}>
              {cat.goals.map((g) => (
                <li key={g} style={{ fontSize: 12.5, color: "var(--color-neutral-700)" }}>
                  {g}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {filtered.length === 0 && <p style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>No goals match &ldquo;{query}&rdquo;.</p>}
      </div>
    </div>
  );
}
