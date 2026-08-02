"use client";

import { useEffect, useState, useTransition } from "react";
import { recordBoardsActivityAction } from "@/app/actions/boards";
import type { BoardTerm } from "@/lib/board-content";

export function BoardTermCard({ dateKey, term }: { dateKey: string; term: BoardTerm }) {
  const storageKey = `limbic:boards-term:${dateKey}`;
  const [revealed, setRevealed] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- restoring today's
       reveal state from localStorage, which is unavailable during SSR */
    setRevealed(localStorage.getItem(storageKey) === "1");
  }, [storageKey]);

  function reveal() {
    if (revealed) return;
    setRevealed(true);
    localStorage.setItem(storageKey, "1");
    startTransition(() => {
      recordBoardsActivityAction(dateKey);
    });
  }

  return (
    <div className="card elev-sm">
      <div className="card-kicker">Term of the day</div>
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, margin: "6px 0" }}>{term.term}</div>
      {revealed ? (
        <>
          <p style={{ fontSize: 14, margin: "0 0 6px" }}>{term.definition}</p>
          {term.memoryAid && (
            <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", fontStyle: "italic", margin: 0 }}>
              {term.memoryAid}
            </p>
          )}
        </>
      ) : (
        <button type="button" className="btn btn-primary" onClick={reveal}>
          Reveal definition
        </button>
      )}
    </div>
  );
}
