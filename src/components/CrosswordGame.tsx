"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import type { CrosswordClue, CrosswordPuzzle } from "@/lib/crossword-puzzles";
import { recordCrosswordCompletionAction } from "@/app/actions/daily-completion";
import { formatElapsed } from "@/lib/meta";
import { nowMs } from "@/lib/clock";
import { ShareCompletionButton } from "@/components/ShareCompletionButton";

type Direction = "across" | "down";
type GameStatus = "playing" | "won";

const SIZE = 5;

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
  nexusOptIn,
}: {
  dateKey: string;
  puzzle: CrosswordPuzzle;
  initial: CrosswordInitialState;
  nexusOptIn: boolean;
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
  const [startedAt] = useState(() => nowMs());
  const [, startTransition] = useTransition();

  const isBlack = useCallback((r: number, c: number) => puzzle.grid[r][c] === null, [puzzle]);

  const activeClue = useMemo(() => findClue(puzzle, direction, selected.row, selected.col), [puzzle, direction, selected]);
  const activeCells = useMemo(() => (activeClue ? new Set(cellsForClue(activeClue, direction).map(([r, c]) => `${r},${c}`)) : new Set<string>()), [activeClue, direction]);

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

  const persist = useCallback(
    (grid: string[][], nextStatus: GameStatus, elapsed?: number) => {
      startTransition(() => recordCrosswordCompletionAction(dateKey, grid, nextStatus, elapsed));
    },
    [dateKey, startTransition]
  );

  const selectCell = useCallback(
    (r: number, c: number) => {
      if (isBlack(r, c)) return;
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
      const next = cells.map((row) => [...row]);
      next[selected.row][selected.col] = letter;
      setCells(next);
      if (isComplete(next)) {
        const elapsed = Math.round((nowMs() - startedAt) / 1000);
        setStatus("won");
        setElapsedSeconds(elapsed);
        persist(next, "won", elapsed);
      } else {
        persist(next, "playing");
      }
      moveWithinWord(1);
    },
    [status, cells, selected, isComplete, persist, startedAt, moveWithinWord]
  );

  const backspace = useCallback(() => {
    if (status === "won") return;
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
  }, [status, cells, selected, puzzle, direction, persist]);

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

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key;
      if (/^[a-zA-Z]$/.test(key)) {
        e.preventDefault();
        typeLetter(key.toUpperCase());
      } else if (key === "Backspace") {
        e.preventDefault();
        backspace();
      } else if (key === "ArrowLeft") {
        e.preventDefault();
        moveArrow(0, -1);
      } else if (key === "ArrowRight") {
        e.preventDefault();
        moveArrow(0, 1);
      } else if (key === "ArrowUp") {
        e.preventDefault();
        moveArrow(-1, 0);
      } else if (key === "ArrowDown") {
        e.preventDefault();
        moveArrow(1, 0);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [typeLetter, backspace, moveArrow]);

  const numberAt = useMemo(() => {
    const map = new Map<string, number>();
    [...puzzle.across, ...puzzle.down].forEach((c) => {
      const key = `${c.row},${c.col}`;
      if (!map.has(key)) map.set(key, c.number);
    });
    return map;
  }, [puzzle]);

  return (
    <div className="screen-pad" style={{ maxWidth: 460, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Limbic Games</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>Today&rsquo;s mini crossword — tap a square and type.</p>

      <div className="crossword-grid">
        {puzzle.grid.map((row, r) =>
          row.map((solutionLetter, c) => {
            const black = solutionLetter === null;
            const isSelected = selected.row === r && selected.col === c;
            const inActiveWord = activeCells.has(`${r},${c}`);
            const number = numberAt.get(`${r},${c}`);
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                disabled={black}
                className={`crossword-cell${black ? " crossword-cell-black" : ""}${isSelected ? " crossword-cell-selected" : inActiveWord ? " crossword-cell-active-word" : ""}${status === "won" ? " crossword-cell-correct" : ""}`}
                onClick={() => selectCell(r, c)}
              >
                {number != null && <span className="crossword-cell-number">{number}</span>}
                {!black && cells[r][c]}
              </button>
            );
          })
        )}
      </div>

      <div className="crossword-clue-banner">
        {activeClue && (
          <>
            <strong>
              {activeClue.number}
              {direction === "across" ? "A" : "D"}
            </strong>{" "}
            · {activeClue.clue}
          </>
        )}
      </div>

      {status === "won" && (
        <div className="card elev-sm" style={{ margin: "16px 0", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 18 }}>Solved it!</div>
          {elapsedSeconds != null && (
            <div style={{ fontSize: 13, color: "var(--color-neutral-700)", marginTop: 4 }}>
              Time: <strong>{formatElapsed(elapsedSeconds)}</strong>
            </div>
          )}
          <div style={{ marginTop: 12 }}>
            <ShareCompletionButton
              nexusOptIn={nexusOptIn}
              body={`Solved today's Limbic mini crossword${elapsedSeconds != null ? ` in ${formatElapsed(elapsedSeconds)}` : ""} 🧩`}
            />
          </div>
        </div>
      )}

      <div className="crossword-clues">
        <div>
          <div className="crossword-clue-list-title">Across</div>
          {puzzle.across.map((clue) => (
            <div
              key={`a-${clue.number}`}
              className={`crossword-clue-item${activeClue?.number === clue.number && direction === "across" ? " crossword-clue-item-active" : ""}`}
              onClick={() => {
                setSelected({ row: clue.row, col: clue.col });
                setDirection("across");
              }}
            >
              <span className="crossword-clue-num">{clue.number}.</span>
              <span>{clue.clue}</span>
            </div>
          ))}
        </div>
        <div>
          <div className="crossword-clue-list-title">Down</div>
          {puzzle.down.map((clue) => (
            <div
              key={`d-${clue.number}`}
              className={`crossword-clue-item${activeClue?.number === clue.number && direction === "down" ? " crossword-clue-item-active" : ""}`}
              onClick={() => {
                setSelected({ row: clue.row, col: clue.col });
                setDirection("down");
              }}
            >
              <span className="crossword-clue-num">{clue.number}.</span>
              <span>{clue.clue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
