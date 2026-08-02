"use client";

import { useState } from "react";
import { recordBoardTermRevealAction } from "@/app/actions/daily-completion";
import { formatElapsed } from "@/lib/meta";
import { nowMs } from "@/lib/clock";
import { ShareCompletionButton } from "@/components/ShareCompletionButton";
import type { BoardTerm } from "@/lib/board-content";

export function BoardTermCard({
  dateKey,
  term,
  initialRevealed,
  initialElapsedSeconds,
  nexusOptIn,
}: {
  dateKey: string;
  term: BoardTerm;
  /** Whether this user has already revealed today's term, as persisted server-side —
   *  replaces what used to be an unscoped "limbic:boards-term:<dateKey>" localStorage key
   *  shared by every account on the same browser. */
  initialRevealed: boolean;
  initialElapsedSeconds: number | null;
  nexusOptIn: boolean;
}) {
  const [revealed, setRevealed] = useState(initialRevealed);
  const [elapsedSeconds, setElapsedSeconds] = useState<number | null>(initialElapsedSeconds);
  const [startedAt] = useState(() => nowMs());

  function reveal() {
    if (revealed) return;
    const elapsed = Math.round((nowMs() - startedAt) / 1000);
    setRevealed(true);
    setElapsedSeconds(elapsed);
    recordBoardTermRevealAction(dateKey, elapsed);
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
          {elapsedSeconds != null && (
            <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "8px 0 0" }}>
              Time: <strong>{formatElapsed(elapsedSeconds)}</strong>
            </p>
          )}
          <div style={{ marginTop: 12 }}>
            <ShareCompletionButton
              nexusOptIn={nexusOptIn}
              body={`Locked in today's Limbic Boards term${elapsedSeconds != null ? ` in ${formatElapsed(elapsedSeconds)}` : ""}.`}
            />
          </div>
        </>
      ) : (
        <button type="button" className="btn btn-primary" onClick={reveal}>
          Reveal definition
        </button>
      )}
    </div>
  );
}
