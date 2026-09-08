"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import type { CrosswordClue, CrosswordPuzzle } from "@/lib/crossword-puzzles";
import { recordCrosswordCompletionAction } from "@/app/actions/daily-completion";
import { formatElapsed } from "@/lib/meta";
import { nowMs } from "@/lib/clock";
import { ArrowLeftIcon } from "@/components/icons";
import { ShareButton } from "@/components/ShareButton";

type Direction = "across" | "down";
type GameStatus = "playing" | "won";

const SIZE = 5;

/** A fixed handful of confetti pieces for the completion overlay (see .crossword-confetti-*
 *  in globals.css) — reuses existing palette tokens rather than inventing new hex values, so
 *  the celebration still reads as "this app's colors," just scattered, and needs no library. */
const CONFETTI_COLORS = [
  "var(--color-accent)",
  "var(--color-accent-2)",
  "var(--color-vitals-mobility)",
  "var(--color-vitals-strength)",
  "var(--color-vitals-mindfulness)",
];
const CONFETTI_PIECES = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 6.5 + (i % 3) * 3) % 100}%`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: `${(i % 5) * 90}ms`,
}));

function emptyCells(): string[][] {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => ""));
}

function cellsForClue(clue: CrosswordClue, direction: Direction): [number, number][] {
  return Array.from({ length: clue.length }, (_, i) =>
    direction === "across" ? [clue.row, clue.col + i] : [clue.row + i, clue.col]
  );
}

function findClue(puzzle: CrosswordPuzzle, direction: Direction, row: number, col: number): CrosswordClue | null {
  const list = direction === "across" ? puzzle.across : puzzle.down;
  return (
    list.find((c) =>
      direction === "across"
        ? c.row === row && col >= c.col && col < c.col + c.length
        : c.col === col && row >= c.row && row < c.row + c.length
    ) ?? null
  );
}

export interface CrosswordInitialState {
  cells: string[][] | null;
  status: GameStatus;
  elapsedSeconds: number | null;
}

export function CrosswordGame({
  dateKey,
  puzzle,
  initial,
}: {
  dateKey: string;
  puzzle: CrosswordPuzzle;
  /** Today's progress/result for this user, as persisted server-side (see
   *  app/actions/daily-completion.ts) — cells null the first time they play today. */
  initial: CrosswordInitialState;
}) {
  const [cells, setCells] = useState<string[][]>(initial.cells ?? emptyCells());
  const [selected, setSelected] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  // The very first click always just confirms the default (0,0) selection rather than
  // toggling direction — without this, clicking that same pre-selected cell first (a very
  // likely first click, being the top-left corner) would hit selectCell's "same cell as
  // already selected" branch and flip to Down before the reader ever saw Across.
  const [touched, setTouched] = useState(false);
  const [direction, setDirection] = useState<Direction>("across");
  const [status, setStatus] = useState<GameStatus>(initial.status);
  const [elapsedSeconds, setElapsedSeconds] = useState<number | null>(initial.elapsedSeconds);
  const [, startTransition] = useTransition();

  // A brief, per-cell "something's off" flash — set the moment every cell fills but the
  // grid isn't fully correct, cleared 500ms later. Only ever fires once nothing is left
  // blank, so it never hints at which specific letter is wrong mid-solve.
  const [flashWrong, setFlashWrong] = useState<Set<string>>(new Set());
  // Overlay dismiss is local UI state, not game state — closing it just lets a solver look
  // back at their finished grid; the puzzle stays recorded "won" either way.
  const [overlayDismissed, setOverlayDismissed] = useState(false);

  // The visible timer (see .crossword-timer) starts on the reader's first keystroke, not on
  // page load — a ref (not state) holds the actual start instant so typeLetter/backspace
  // always read the current value, while `timerRunning` is the bit of state that actually
  // drives the ticking interval below.
  const firstInputAtRef = useRef<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [liveElapsed, setLiveElapsed] = useState(0);

  const isBlack = useCallback((r: number, c: number) => puzzle.grid[r][c] === null, [puzzle]);

  const activeClue = useMemo(() => findClue(puzzle, direction, selected.row, selected.col), [puzzle, direction, selected]);
  const activeCells = useMemo(
    () => (activeClue ? new Set(cellsForClue(activeClue, direction).map(([r, c]) => `${r},${c}`)) : new Set<string>()),
    [activeClue, direction]
  );

  const isComplete = useCallback(
    (grid: string[][]) => {
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          if (isBlack(r, c)) continue;
          if (grid[r][c].toUpperCase() !== puzzle.grid[r][c]) return false;
        }
      }
      return true;
    },
    [isBlack, puzzle]
  );

  const isFull = useCallback(
    (grid: string[][]) => {
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          if (isBlack(r, c)) continue;
          if (grid[r][c] === "") return false;
        }
      }
      return true;
    },
    [isBlack]
  );

  /** Whether every square of a clue has *a* letter in it — deliberately not whether those
   *  letters are right. The clue list used to strike an entry through the moment it matched
   *  the answer, which handed the solver a free correctness oracle: you could confirm any
   *  guess without committing to it, and worse, pin down a single unknown square by cycling
   *  A-Z and watching for the strike-through. Marking "filled" instead keeps the progress
   *  signal (what's left to do) and takes away the answer key; the only correctness feedback
   *  left is the whole-grid check on the last square, same as a real mini. */
  const isClueFilled = useCallback(
    (clue: CrosswordClue, dir: Direction) => cellsForClue(clue, dir).every(([r, c]) => cells[r][c] !== ""),
    [cells]
  );

  const persist = useCallback(
    (grid: string[][], nextStatus: GameStatus, elapsed?: number) => {
      startTransition(() => recordCrosswordCompletionAction(dateKey, grid, nextStatus, elapsed));
    },
    [dateKey, startTransition]
  );

  const ensureTimerStarted = useCallback(() => {
    if (firstInputAtRef.current == null) {
      firstInputAtRef.current = nowMs();
      setTimerRunning(true);
    }
  }, []);

  useEffect(() => {
    if (!timerRunning || status !== "playing") return;
    const id = setInterval(() => {
      if (firstInputAtRef.current != null) setLiveElapsed(Math.round((nowMs() - firstInputAtRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, status]);

  // The single focus target for every keystroke, letter or navigation — a visually hidden
  // <input> (see .crossword-hidden-input) rather than the old on-screen A-Z button strip, so
  // tapping a cell brings up the device's own keyboard on mobile instead of requiring a
  // slide-to-find-the-letter tap on a cramped alphabet row. Kept focused throughout play by
  // refocusing it on every cell/clue selection below.
  const inputRef = useRef<HTMLInputElement>(null);

  const selectCell = useCallback(
    (r: number, c: number) => {
      if (isBlack(r, c)) return;
      inputRef.current?.focus();
      if (touched && selected.row === r && selected.col === c) {
        const other: Direction = direction === "across" ? "down" : "across";
        if (findClue(puzzle, other, r, c)) setDirection(other);
        return;
      }
      setTouched(true);
      setSelected({ row: r, col: c });
      if (!findClue(puzzle, direction, r, c)) {
        const other: Direction = direction === "across" ? "down" : "across";
        if (findClue(puzzle, other, r, c)) setDirection(other);
      }
    },
    [isBlack, puzzle, selected, direction, touched]
  );

  const moveWithinWord = useCallback(
    (delta: 1 | -1) => {
      const clue = findClue(puzzle, direction, selected.row, selected.col);
      if (!clue) return;
      const cellList = cellsForClue(clue, direction);
      const idx = cellList.findIndex(([r, c]) => r === selected.row && c === selected.col);
      const nextIdx = idx + delta;
      if (nextIdx >= 0 && nextIdx < cellList.length) {
        const [nr, nc] = cellList[nextIdx];
        setSelected({ row: nr, col: nc });
      }
    },
    [puzzle, direction, selected]
  );

  const typeLetter = useCallback(
    (letter: string) => {
      if (status === "won") return;
      ensureTimerStarted();
      const next = cells.map((row) => [...row]);
      next[selected.row][selected.col] = letter;
      setCells(next);
      if (isComplete(next)) {
        const elapsed = Math.round((nowMs() - (firstInputAtRef.current ?? nowMs())) / 1000);
        setStatus("won");
        setElapsedSeconds(elapsed);
        persist(next, "won", elapsed);
      } else {
        persist(next, "playing");
        if (isFull(next)) {
          const wrong = new Set<string>();
          for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
              if (!isBlack(r, c) && next[r][c].toUpperCase() !== puzzle.grid[r][c]) wrong.add(`${r},${c}`);
            }
          }
          setFlashWrong(wrong);
          window.setTimeout(() => setFlashWrong(new Set()), 500);
        }
      }
      moveWithinWord(1);
    },
    [status, cells, selected, isComplete, isFull, isBlack, puzzle, persist, moveWithinWord, ensureTimerStarted]
  );

  const backspace = useCallback(() => {
    if (status === "won") return;
    ensureTimerStarted();
    const current = cells[selected.row][selected.col];
    if (current) {
      const next = cells.map((row) => [...row]);
      next[selected.row][selected.col] = "";
      setCells(next);
      persist(next, "playing");
    } else {
      const clue = findClue(puzzle, direction, selected.row, selected.col);
      if (!clue) return;
      const cellList = cellsForClue(clue, direction);
      const idx = cellList.findIndex(([r, c]) => r === selected.row && c === selected.col);
      if (idx > 0) {
        const [pr, pc] = cellList[idx - 1];
        const next = cells.map((row) => [...row]);
        next[pr][pc] = "";
        setCells(next);
        setSelected({ row: pr, col: pc });
        persist(next, "playing");
      }
    }
  }, [status, cells, selected, puzzle, direction, persist, ensureTimerStarted]);

  const moveArrow = useCallback(
    (dr: number, dc: number) => {
      let r = selected.row;
      let c = selected.col;
      for (let step = 0; step < SIZE; step++) {
        r += dr;
        c += dc;
        if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return;
        if (!isBlack(r, c)) {
          setSelected({ row: r, col: c });
          setDirection(dr !== 0 ? "down" : "across");
          return;
        }
      }
    },
    [selected, isBlack]
  );

  // Auto-focus on mount so a desktop reader can start typing immediately, same as the old
  // window-level listener let them — mobile readers get the keyboard on their first tap
  // instead, since iOS/Android only allow a focus() call to raise the keyboard from inside a
  // user gesture (a plain mount effect can't do that on touch devices).
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Backspace and the arrow keys never produce a printable character, so they're handled
  // here on keydown; every letter (physical or on-screen mobile keyboard alike) goes through
  // handleHiddenInputChange below instead — splitting it this way, rather than reading
  // e.key for letters too, is what makes this work reliably across mobile keyboards that
  // don't always dispatch a conventional keydown for a typed letter (predictive-text taps,
  // swipe input) but always fire a change event.
  const handleHiddenInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        backspace();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        moveArrow(0, -1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        moveArrow(0, 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        moveArrow(-1, 0);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        moveArrow(1, 0);
      }
    },
    [backspace, moveArrow]
  );

  // Cleared back to "" after every keystroke so the input is always ready for the next
  // single letter — takes the last letter typed rather than the first, so a mobile keyboard
  // that briefly leaves an autocomplete suggestion in the field still behaves correctly.
  const handleHiddenInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const letters = e.target.value.replace(/[^a-zA-Z]/g, "");
      e.target.value = "";
      if (letters) typeLetter(letters[letters.length - 1].toUpperCase());
    },
    [typeLetter]
  );

  const numberAt = useMemo(() => {
    const map = new Map<string, number>();
    [...puzzle.across, ...puzzle.down].forEach((c) => {
      const key = `${c.row},${c.col}`;
      if (!map.has(key)) map.set(key, c.number);
    });
    return map;
  }, [puzzle]);

  const dateObj = useMemo(() => new Date(`${dateKey}T00:00:00`), [dateKey]);
  const headerDateLabel = useMemo(
    () => dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    [dateObj]
  );
  const shareDateLabel = useMemo(() => dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric" }), [dateObj]);

  const displaySeconds = status === "won" ? (elapsedSeconds ?? 0) : liveElapsed;
  const shareText = `Limbic Mini Crossword, ${shareDateLabel}\nCompleted in ${formatElapsed(elapsedSeconds ?? 0)}\nlimbic.center/crossword`;

  return (
    <div className="crossword-page-pad">
      <Link href="/games" className="crossword-back-link">
        <ArrowLeftIcon size={14} />
        Back to Games
      </Link>

      <h1 className="crossword-title">Mini Crossword</h1>
      <p className="crossword-subtitle">Today&rsquo;s mini crossword, tap a square and type</p>
      <div className="crossword-date">{headerDateLabel}</div>

      <div className="crossword-layout">
        <div className="crossword-left-col">
          <div className="crossword-left-header">
            <span className="crossword-timer">{formatElapsed(displaySeconds)}</span>
          </div>

          <div className="crossword-grid-center">
            <div className="crossword-grid-wrap">
              <div className="crossword-grid">
                {puzzle.grid.map((row, r) =>
                  row.map((solutionLetter, c) => {
                    const black = solutionLetter === null;
                    // Once solved, every cell already carries the "correct" green tint —
                    // dropping the selection highlight then avoids the old selected cell
                    // keeping its white text color on top of that green background.
                    const isSelected = status !== "won" && selected.row === r && selected.col === c;
                    const inActiveWord = activeCells.has(`${r},${c}`);
                    const number = numberAt.get(`${r},${c}`);
                    const wrongFlash = flashWrong.has(`${r},${c}`);
                    const classes = [
                      "crossword-cell",
                      black && "crossword-cell-black",
                      isSelected && "crossword-cell-selected",
                      !isSelected && inActiveWord && "crossword-cell-active-word",
                      status === "won" && "crossword-cell-correct",
                      wrongFlash && "crossword-cell-wrong-flash",
                    ]
                      .filter(Boolean)
                      .join(" ");
                    return (
                      <button key={`${r}-${c}`} type="button" disabled={black} className={classes} onClick={() => selectCell(r, c)}>
                        {number != null && <span className="crossword-cell-number">{number}</span>}
                        {!black && cells[r][c]}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="crossword-clue-banner">
            {activeClue && (
              <>
                <span className="crossword-clue-banner-num">
                  {activeClue.number}
                  {direction === "across" ? "A" : "D"}
                </span>
                {activeClue.clue}
              </>
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            defaultValue=""
            onChange={handleHiddenInputChange}
            onKeyDown={handleHiddenInputKeyDown}
            className="crossword-hidden-input"
            aria-label="Type a letter"
          />
        </div>

        <div className="crossword-right-col">
          <div className="crossword-clues-panel">
            <div>
              <div className="crossword-clue-section-title">Across</div>
              {puzzle.across.map((clue) => (
                <div
                  key={`a-${clue.number}`}
                  className={`crossword-clue-item${
                    activeClue?.number === clue.number && direction === "across" ? " crossword-clue-item-active" : ""
                  }${isClueFilled(clue, "across") ? " crossword-clue-item-filled" : ""}`}
                  onClick={() => {
                    inputRef.current?.focus();
                    setTouched(true);
                    setSelected({ row: clue.row, col: clue.col });
                    setDirection("across");
                  }}
                >
                  <span className="crossword-clue-num">{clue.number}</span>
                  <span>{clue.clue}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="crossword-clue-section-title">Down</div>
              {puzzle.down.map((clue) => (
                <div
                  key={`d-${clue.number}`}
                  className={`crossword-clue-item${
                    activeClue?.number === clue.number && direction === "down" ? " crossword-clue-item-active" : ""
                  }${isClueFilled(clue, "down") ? " crossword-clue-item-filled" : ""}`}
                  onClick={() => {
                    inputRef.current?.focus();
                    setTouched(true);
                    setSelected({ row: clue.row, col: clue.col });
                    setDirection("down");
                  }}
                >
                  <span className="crossword-clue-num">{clue.number}</span>
                  <span>{clue.clue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {status === "won" && !overlayDismissed && (
        <div className="crossword-complete-overlay" onClick={() => setOverlayDismissed(true)}>
          <div className="crossword-complete-card" onClick={(e) => e.stopPropagation()}>
            <div className="crossword-confetti-layer">
              {CONFETTI_PIECES.map((p, i) => (
                <span
                  key={i}
                  className="crossword-confetti-piece"
                  style={{ left: p.left, background: p.color, animationDelay: p.delay }}
                />
              ))}
            </div>
            <button type="button" className="crossword-complete-close" aria-label="Close" onClick={() => setOverlayDismissed(true)}>
              ×
            </button>
            <div className="crossword-complete-title">Puzzle Complete</div>
            <div className="crossword-complete-time">Completed in {formatElapsed(elapsedSeconds ?? 0)}</div>
            <div className="crossword-complete-actions">
              <ShareButton text={shareText} label="Share Result" className="btn btn-primary" />
              <Link href="/games" className="btn btn-secondary">
                Back to Games
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
