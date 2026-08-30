"use client";

import { useEffect, useState } from "react";
import { searchPrograms, setUserProgram } from "@/app/actions/dpt-programs";
import type { DPTProgram } from "@/generated/prisma/client";
import { CheckIcon } from "@/components/icons";

/** Shared program-picker search box — onboarding's Step 2 (components/OnboardingRoleModal.tsx)
 *  and Profile's "Your Program" section (components/ProgramTimelineSection.tsx) both render
 *  this instead of each rolling their own, so the two never drift out of sync (same reasoning
 *  as components/RoleCards.tsx being shared by those same two surfaces for role selection).
 *  Owns the search-and-select mechanics only — calls setUserProgram itself and reports the
 *  chosen program back via onSelected; what happens after selection (a confirmation card, a
 *  Continue button, a "Change" link) is entirely up to the caller. */
export function ProgramSearch({ placeholder, onSelected }: { placeholder: string; onSelected: (program: DPTProgram) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DPTProgram[]>([]);
  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    const q = query.trim();
    const handle = window.setTimeout(() => {
      if (!q) {
        setResults([]);
        return;
      }
      searchPrograms(q).then((rows) => setResults(rows.slice(0, 8)));
    }, 250);
    return () => window.clearTimeout(handle);
  }, [query]);

  function handlePick(program: DPTProgram) {
    setPendingId(program.id);
    setUserProgram(program.id).then((result) => {
      setPendingId(null);
      if (!("error" in result)) {
        onSelected(program);
        setQuery("");
        setResults([]);
      }
    });
  }

  return (
    <div className="program-search">
      <input
        type="text"
        className="input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {results.length > 0 && (
        <div className="program-search-results">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              className="program-search-result"
              disabled={pendingId !== null}
              onClick={() => handlePick(p)}
            >
              <span className="program-search-result-name">
                {p.institution}
                {pendingId === p.id && <CheckIcon size={13} className="program-search-result-check" />}
              </span>
              <span className="program-search-result-meta">
                {p.stateName} · {p.calendarType ?? "Not published"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
