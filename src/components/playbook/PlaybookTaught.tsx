"use client";

/**
 * The taught lane — a line under any cell for what the reader's own program teaches
 * (see lib/playbook-taught.ts for which cells have one and how they are keyed).
 *
 * Nothing here is pre-filled, and that is the point: the guide can say what the literature
 * measured and where the taught answer differs from it, but it cannot know which answer your
 * program marks you on. So the lane opens empty and the reader fills it, and the guide's own
 * text is never overwritten — the line sits beneath it.
 *
 * One switch in the nav opens every lane at once rather than each cell offering its own
 * affordance: the alternative is several hundred buttons nobody sees until they hover, and a
 * tab order nobody can get through. With the lane closed, only the lines that have something
 * in them show, so a reader's own notes stay part of the page — and print with it.
 *
 * The editors are uncontrolled and commit on blur. A controlled textarea per cell would
 * re-render the whole page on every keystroke, and there is nothing to gain from it: what
 * matters is the line as it stands when the reader moves on.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { playbookInlineText } from "@/lib/playbook-inline";
import { readStored, subscribeToStore, writeStored } from "@/lib/playbook-store";
import type { PlaybookTaughtCell } from "@/lib/playbook-taught";

type TaughtNotes = Record<string, string>;

const NO_NOTES: TaughtNotes = {};

interface TaughtValue {
  /** Every lane is open for typing, empty ones included. */
  open: boolean;
  toggle: () => void;
  notes: TaughtNotes;
  count: number;
  /** Bumped by "clear my lines" so the uncontrolled editors remount empty. */
  generation: number;
  save: (cellId: string, text: string) => void;
  clearAll: () => void;
  exportText: () => string;
}

const TaughtContext = createContext<TaughtValue | null>(null);

export function PlaybookTaughtProvider({
  slug,
  cells,
  children,
}: {
  slug: string;
  cells: PlaybookTaughtCell[];
  children: React.ReactNode;
}) {
  const key = `limbic-playbook-${slug}-taught-v1`;
  const notes = useSyncExternalStore(
    subscribeToStore,
    () => (readStored(key) as TaughtNotes | null) ?? NO_NOTES,
    () => NO_NOTES,
  );
  const [open, setOpen] = useState(false);
  const [generation, setGeneration] = useState(0);

  // Reads the store rather than closing over `notes`, so saving keeps a stable identity and
  // typing in one cell doesn't remount the editors in every other one.
  const save = useCallback(
    (cellId: string, text: string) => {
      const trimmed = text.trim();
      const current = (readStored(key) as TaughtNotes | null) ?? NO_NOTES;
      if ((current[cellId] ?? "") === trimmed) return;
      const next = { ...current };
      if (trimmed) next[cellId] = trimmed;
      else delete next[cellId];
      writeStored(key, next);
    },
    [key],
  );

  const clearAll = useCallback(() => {
    writeStored(key, {});
    setGeneration((n) => n + 1);
  }, [key]);

  /** Markdown, with the guide's own wording above each line — a lane on its own is a sentence
   *  with no subject a week later. */
  const exportText = useCallback(() => {
    const lines: string[] = [];
    let section = "";
    for (const cell of cells) {
      const note = notes[cell.id];
      if (!note) continue;
      if (cell.section !== section) {
        section = cell.section;
        lines.push(`# ${section}`);
      }
      lines.push(`## ${playbookInlineText(cell.row)} — ${cell.column}`);
      lines.push(`> ${playbookInlineText(cell.text)}`);
      lines.push(note);
    }
    return lines.length ? lines.join("\n\n") : "Nothing added yet.";
  }, [cells, notes]);

  const value = useMemo<TaughtValue>(
    () => ({
      open,
      toggle: () => setOpen((on) => !on),
      notes,
      count: Object.keys(notes).length,
      generation,
      save,
      clearAll,
      exportText,
    }),
    [clearAll, exportText, generation, notes, open, save],
  );

  return <TaughtContext.Provider value={value}>{children}</TaughtContext.Provider>;
}

/* ---------- the lane itself ---------- */

function TaughtEditor({ cellId, initial, save }: { cellId: string; initial: string; save: TaughtValue["save"] }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  /** Grows to whatever was typed: a taught answer is a sentence, but sometimes three. */
  const grow = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(grow, [grow]);

  return (
    <textarea
      ref={ref}
      rows={1}
      className="playbook-taught-input"
      defaultValue={initial}
      placeholder="what your program teaches"
      aria-label="What your program teaches"
      onInput={grow}
      onBlur={(event) => save(cellId, event.target.value)}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.currentTarget.value = initial;
        event.currentTarget.blur();
      }}
    />
  );
}

/** Rendered inside every maskable cell (PlaybookMaskCell). `suppressed` is set while the cell
 *  is blanked for recall — the reader's own line would usually give the answer away. */
export function PlaybookTaughtLane({ cellId, suppressed }: { cellId: string; suppressed: boolean }) {
  const taught = useContext(TaughtContext);
  if (!taught || suppressed) return null;

  const note = taught.notes[cellId] ?? "";
  if (!taught.open) {
    if (!note) return null;
    return (
      <p className="playbook-taught playbook-taught-set">
        <span className="playbook-taught-tag">Taught</span>
        {note}
      </p>
    );
  }

  return (
    <div className={note ? "playbook-taught playbook-taught-set" : "playbook-taught"}>
      <span className="playbook-taught-tag">Taught</span>
      {/* Keyed by the saved line so clearing the page, or a save, reseeds the uncontrolled
          field instead of leaving stale text in it. */}
      <TaughtEditor key={`${taught.generation}:${note}`} cellId={cellId} initial={note} save={taught.save} />
    </div>
  );
}

/* ---------- controls ---------- */

/** The nav switch, beside recall's. */
export function PlaybookTaughtToggle() {
  const taught = useContext(TaughtContext);
  if (!taught) return null;
  return (
    <button
      type="button"
      className="playbook-taught-toggle"
      aria-pressed={taught.open}
      onClick={taught.toggle}
      title="Open a line under every cell for what your program teaches"
    >
      {taught.count ? `Taught (${taught.count})` : "Taught"}
    </button>
  );
}

/** The explanation and the page-wide controls, up while the lane is open or anything is in it. */
export function PlaybookTaughtBar() {
  const taught = useContext(TaughtContext);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!taught) return;
    try {
      await navigator.clipboard.writeText(taught.exportText());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // No clipboard permission — the lines are still on the page and still print.
    }
  };

  if (!taught || (!taught.open && !taught.count)) return null;

  return (
    <div className="playbook-taughtbar">
      <span>
        <b>Taught lane.</b> Every line here is yours and starts empty — what your program teaches is yours to state, not
        ours to guess. Type under any cell; the guide&rsquo;s own text is never changed, your line sits beneath it. Where
        the taught answer and the measured one differ, write the taught answer in the exam and know why it is shaky.
        Lines save in this browser and print with the page.
      </span>
      <span className="playbook-taught-count">{taught.count ? `${taught.count} line${taught.count === 1 ? "" : "s"}` : ""}</span>
      <button type="button" onClick={copy} disabled={!taught.count}>
        {copied ? "Copied" : "Copy my lines"}
      </button>
      <button type="button" onClick={taught.clearAll} disabled={!taught.count}>
        Clear my lines
      </button>
    </div>
  );
}
