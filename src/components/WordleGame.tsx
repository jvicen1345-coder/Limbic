"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import { wordForDate } from "@/lib/wordle-words";
import { recordWordleCompletionAction } from "@/app/actions/daily-completion";
import { formatElapsed } from "@/lib/meta";
import { nowMs } from "@/lib/clock";
import { ShareCompletionButton } from "@/components/ShareCompletionButton";

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

type LetterStatus = "correct" | "present" | "absent";
type TileState = LetterStatus | "filled" | "empty";
type GameStatus = "playing" | "won" | "lost";

const STATUS_RANK: Record<LetterStatus, number> = { absent: 0, present: 1, correct: 2 };

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"],
];

/** Standard two-pass Wordle scoring: exact-position matches first, then leftover letters
 *  matched against leftover answer letters — so a guess with a repeated letter only gets
 *  as many "present" marks as the answer actually has copies of it. */
function evaluateGuess(guess: string, answer: string): LetterStatus[] {
  const result: LetterStatus[] = new Array(guess.length).fill("absent");
  const answerLetters = answer.split("");
  const used = new Array(answer.length).fill(false);

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === answerLetters[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  }
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === "correct") continue;
    const idx = answerLetters.findIndex((c, j) => c === guess[i] && !used[j]);
    if (idx !== -1) {
      result[i] = "present";
      used[idx] = true;
    }
  }
  return result;
}

export interface WordleInitialState {
  guesses: string[];
  status: GameStatus;
  elapsedSeconds: number | null;
}

export function WordleGame({
  dateKey,
  initial,
  nexusOptIn,
}: {
  dateKey: string;
  /** Today's progress/result for this user, as persisted server-side (see
   *  app/actions/daily-completion.ts) — null the first time they play today. Replaces what
   *  used to be an unscoped "limbic:wordle:<dateKey>" localStorage key shared by every
   *  account on the same browser. */
  initial: WordleInitialState | null;
  nexusOptIn: boolean;
}) {
  const answer = useMemo(() => wordForDate(dateKey), [dateKey]);

  const [guesses, setGuesses] = useState<string[]>(initial?.guesses ?? []);
  const [current, setCurrent] = useState("");
  const [status, setStatus] = useState<GameStatus>(initial?.status ?? "playing");
  const [elapsedSeconds, setElapsedSeconds] = useState<number | null>(initial?.elapsedSeconds ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const [startedAt] = useState(() => nowMs());

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 1500);
    return () => clearTimeout(timer);
  }, [message]);

  const submitGuess = useCallback(() => {
    if (current.length !== WORD_LENGTH) {
      setMessage("Not enough letters");
      return;
    }
    const next = [...guesses, current];
    const won = current === answer;
    const nextStatus: GameStatus = won ? "won" : next.length >= MAX_GUESSES ? "lost" : "playing";
    const nextElapsed = nextStatus === "playing" ? undefined : Math.round((nowMs() - startedAt) / 1000);

    setGuesses(next);
    setCurrent("");
    setStatus(nextStatus);
    if (nextElapsed !== undefined) setElapsedSeconds(nextElapsed);

    recordWordleCompletionAction(dateKey, next, nextStatus, nextElapsed);
  }, [current, guesses, answer, dateKey, startedAt]);

  const handleKey = useCallback(
    (key: string) => {
      if (status !== "playing") return;
      if (key === "ENTER") {
        submitGuess();
      } else if (key === "BACK") {
        setCurrent((c) => c.slice(0, -1));
      } else if (/^[A-Z]$/.test(key)) {
        setCurrent((c) => (c.length < WORD_LENGTH ? c + key : c));
      }
    },
    [status, submitGuess]
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toUpperCase();
      if (key === "ENTER") handleKey("ENTER");
      else if (key === "BACKSPACE") handleKey("BACK");
      else if (/^[A-Z]$/.test(key)) handleKey(key);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  const keyStatuses = useMemo(() => {
    const map: Partial<Record<string, LetterStatus>> = {};
    for (const g of guesses) {
      evaluateGuess(g, answer).forEach((s, i) => {
        const letter = g[i];
        const existing = map[letter];
        if (!existing || STATUS_RANK[s] > STATUS_RANK[existing]) map[letter] = s;
      });
    }
    return map;
  }, [guesses, answer]);

  const rows = Array.from({ length: MAX_GUESSES }, (_, i) => {
    if (i < guesses.length) {
      const letters = guesses[i].split("");
      const evalR = evaluateGuess(guesses[i], answer);
      return letters.map((letter, ci) => ({ letter, state: evalR[ci] as TileState }));
    }
    if (i === guesses.length && status === "playing") {
      return Array.from({ length: WORD_LENGTH }, (_, ci) => {
        const letter = current[ci];
        return { letter: letter ?? "", state: (letter ? "filled" : "empty") as TileState };
      });
    }
    return Array.from({ length: WORD_LENGTH }, () => ({ letter: "", state: "empty" as TileState }));
  });

  return (
    <div className="screen-pad" style={{ maxWidth: 460, margin: "0 auto" }}>
      {/* Same header shape as the Mini Crossword (see CrosswordGame.tsx): a persistent way
          back to the hub, and the game's own name rather than the section's. This page used
          to title itself "Limbic Games" — the name of the hub listing it — and offered no
          back link at all, while /games lists it as "Daily Term". */}
      <Link href="/games" className="game-back-link">
        <ArrowLeftIcon size={14} />
        Back to Games
      </Link>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Daily Term</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        Guess today&rsquo;s 5-letter health & wellness word in 6 tries.
      </p>

      <div className="wordle-legend">
        <span className="wordle-legend-item">
          <span className="wordle-legend-swatch wordle-legend-swatch-correct" />
          Correct spot
        </span>
        <span className="wordle-legend-item">
          <span className="wordle-legend-swatch wordle-legend-swatch-present" />
          Wrong spot
        </span>
        <span className="wordle-legend-item">
          <span className="wordle-legend-swatch wordle-legend-swatch-absent" />
          Not in word
        </span>
      </div>

      <div style={{ minHeight: 26, marginBottom: 6 }}>
        {message && <span className="tag tag-outline">{message}</span>}
      </div>

      <div className="wordle-grid">
        {rows.map((row, ri) => (
          <div key={ri} className="wordle-row">
            {row.map((tile, ci) => (
              <div key={ci} className={`wordle-tile wordle-tile-${tile.state}`}>
                {tile.letter}
              </div>
            ))}
          </div>
        ))}
      </div>

      {status !== "playing" && (
        <div className="card elev-sm" style={{ margin: "16px 0", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 18 }}>
            {status === "won" ? "Nice work!" : "So close!"}
          </div>
          <div style={{ fontSize: 13, color: "var(--color-neutral-700)", marginTop: 4 }}>
            {status === "lost" && (
              <>
                Today&rsquo;s word was <strong>{answer}</strong>.{" "}
              </>
            )}
            Come back tomorrow for a new word.
          </div>
          {elapsedSeconds != null && (
            <div style={{ fontSize: 13, color: "var(--color-neutral-700)", marginTop: 8 }}>
              Time: <strong>{formatElapsed(elapsedSeconds)}</strong> · {guesses.length}/{MAX_GUESSES} guesses
            </div>
          )}
          <div style={{ marginTop: 12 }}>
            <ShareCompletionButton
              nexusOptIn={nexusOptIn}
              body={
                status === "won"
                  ? `Solved today's Daily Term in ${guesses.length}/${MAX_GUESSES} guesses${
                      elapsedSeconds != null ? `, ${formatElapsed(elapsedSeconds)}` : ""
                    } 🎯`
                  : `Gave today's Daily Term a shot${elapsedSeconds != null ? ` (${formatElapsed(elapsedSeconds)})` : ""}, back at it tomorrow.`
              }
            />
          </div>
        </div>
      )}

      <div className="wordle-keyboard">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="wordle-keyboard-row">
            {row.map((key) => {
              const label = key === "BACK" ? "⌫" : key === "ENTER" ? "Enter" : key;
              const st = keyStatuses[key];
              const wide = key === "ENTER" || key === "BACK";
              return (
                <button
                  key={key}
                  type="button"
                  className={`wordle-key${st ? ` wordle-key-${st}` : ""}${wide ? " wordle-key-wide" : ""}`}
                  onClick={() => handleKey(key)}
                  disabled={status !== "playing"}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
