"use client";

/**
 * Recall mode — the study half of a playbook (see lib/playbook-recall.ts for the group model).
 *
 * A playbook is a reference until you can answer it without reading it, so every answer on the
 * page can be blanked and checked. The state lives here rather than in each block: a section
 * heading has to switch the tables underneath it, the nav button has to switch the whole page,
 * and "hide missed" has to re-blank cells across every table at once, none of which a single
 * table can know about.
 *
 * Two masking modes. In `cols`, what is hidden is whichever columns the reader chose. In
 * `missed`, only the cells they marked wrong are hidden, wherever they are — the second pass
 * over a page they have already worked through. Touching any chip returns to `cols`.
 *
 * What the reader chose and what they got wrong persist in their browser only, through the
 * same little external store the checklist uses (PlaybookChecklist): this is a scratch pad for
 * working a page, not a record worth a round trip to the database. The store is read through
 * useSyncExternalStore with an empty server snapshot, because localStorage does not exist
 * while the page is being rendered on the server and reading it during render would produce
 * different markup than the server sent.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { RECALL_SOLID_MAX_CHARS, recallCellId, recallColumnId, type RecallGroup } from "@/lib/playbook-recall";

/* ---------- the persisted half ---------- */

const listeners = new Set<() => void>();
/** Parsed once per key and frozen: useSyncExternalStore compares snapshots by identity, so a
 *  fresh array on every read would loop forever. */
const cache = new Map<string, unknown>();

function readStored(key: string): unknown {
  if (cache.has(key)) return cache.get(key);
  let parsed: unknown = null;
  try {
    const raw = window.localStorage.getItem(key);
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    // A private window, or storage turned off. Recall still works; it just won't be
    // remembered, which is better than the page failing to render.
    parsed = null;
  }
  cache.set(key, parsed);
  return parsed;
}

function writeStored(key: string, value: unknown) {
  cache.set(key, value);
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // As above — a failed write shouldn't break the interaction.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const NO_COLUMNS: string[] = [];
const NO_MISSED: string[] = [];

/* ---------- context ---------- */

interface RecallValue {
  groups: RecallGroup[];
  openGroups: ReadonlySet<string>;
  /** The column is blanked — before the reader has clicked any individual cell open. */
  isColumnMasked: (groupId: string, column: number) => boolean;
  isCellMasked: (groupId: string, column: number, row: number) => boolean;
  isRevealed: (cellId: string) => boolean;
  isMissed: (cellId: string) => boolean;
  missedCount: number;
  anyOpen: boolean;
  toggleGroup: (groupId: string) => void;
  toggleColumn: (groupId: string, column: number) => void;
  toggleSection: (sectionId: string) => void;
  toggleEverything: () => void;
  reveal: (cellId: string) => void;
  toggleMissed: (cellId: string) => void;
  revealAll: () => void;
  drillMissed: () => void;
  clearMissed: () => void;
  /** Row indexes in this group that hold a missed cell — what stripes a row. */
  missedRows: (groupId: string) => ReadonlySet<number>;
}

const RecallContext = createContext<RecallValue | null>(null);

export function useRecall(): RecallValue {
  const value = useContext(RecallContext);
  if (!value) throw new Error("Playbook recall components must render inside <PlaybookRecallProvider>");
  return value;
}

export function PlaybookRecallProvider({
  slug,
  groups,
  children,
}: {
  slug: string;
  groups: RecallGroup[];
  children: React.ReactNode;
}) {
  const stateKey = `limbic-playbook-${slug}-recall-v1`;
  const missedKey = `limbic-playbook-${slug}-missed-v1`;

  const storedCols = useSyncExternalStore(
    subscribe,
    () => (readStored(stateKey) as string[] | null) ?? NO_COLUMNS,
    () => NO_COLUMNS,
  );
  const storedMissed = useSyncExternalStore(
    subscribe,
    () => (readStored(missedKey) as string[] | null) ?? NO_MISSED,
    () => NO_MISSED,
  );

  // Transient: which cells the reader has clicked open, and whether they are drilling the
  // ones they missed. Neither is worth remembering between visits.
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(() => new Set());
  const [mode, setMode] = useState<"cols" | "missed">("cols");

  const hidden = useMemo(() => new Set(storedCols), [storedCols]);
  const missed = useMemo(() => new Set(storedMissed), [storedMissed]);
  const byId = useMemo(() => new Map(groups.map((group) => [group.id, group])), [groups]);

  /** A group is open when any of its columns is hidden — there is no separate flag to keep in
   *  step, so unhiding the last column closes the group and its chips fold away with it. */
  const openGroups = useMemo(() => {
    const open = new Set<string>();
    hidden.forEach((id) => open.add(id.slice(0, id.lastIndexOf("|"))));
    return open;
  }, [hidden]);

  const commit = useCallback(
    (next: Set<string>) => {
      setRevealed(new Set());
      setMode("cols");
      writeStored(stateKey, [...next]);
    },
    [stateKey],
  );

  /** Switching a group on hides its last column — the finding, which is what the row is for.
   *  A one-column group (a figure's labels) hides the only thing it has. */
  const applyGroup = useCallback((group: RecallGroup, on: boolean, into: Set<string>) => {
    group.labels.forEach((_, i) => {
      const id = recallColumnId(group.id, i);
      if (on && (group.labels.length === 1 || i === group.labels.length - 1)) into.add(id);
      else into.delete(id);
    });
  }, []);

  const setGroups = useCallback(
    (ids: string[], on: boolean) => {
      const next = new Set(hidden);
      ids.forEach((id) => {
        const group = byId.get(id);
        if (group) applyGroup(group, on, next);
      });
      commit(next);
    },
    [applyGroup, byId, commit, hidden],
  );

  const toggleGroup = useCallback(
    (groupId: string) => setGroups([groupId], !openGroups.has(groupId)),
    [openGroups, setGroups],
  );

  const toggleSection = useCallback(
    (sectionId: string) => {
      const ids = groups.filter((group) => group.sectionId === sectionId).map((group) => group.id);
      setGroups(ids, !ids.some((id) => openGroups.has(id)));
    },
    [groups, openGroups, setGroups],
  );

  /** The master switch. Off, everything clears. On, it blanks everything that can be blanked
   *  except the first column of each table — the one that names the row, and so the only thing
   *  left to recall the rest of it from. */
  const toggleEverything = useCallback(() => {
    if (openGroups.size) {
      commit(new Set());
      return;
    }
    const next = new Set<string>();
    groups.forEach((group) => {
      group.labels.forEach((_, i) => {
        if (group.labels.length === 1 || i > 0) next.add(recallColumnId(group.id, i));
      });
    });
    commit(next);
  }, [commit, groups, openGroups]);

  const toggleColumn = useCallback(
    (groupId: string, column: number) => {
      const id = recallColumnId(groupId, column);
      const next = new Set(hidden);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      commit(next);
    },
    [commit, hidden],
  );

  const reveal = useCallback((cellId: string) => {
    setRevealed((prev) => new Set(prev).add(cellId));
  }, []);

  const toggleMissed = useCallback(
    (cellId: string) => {
      const next = new Set(missed);
      if (next.has(cellId)) next.delete(cellId);
      else next.add(cellId);
      writeStored(missedKey, [...next]);
    },
    [missed, missedKey],
  );

  /** Reveals every masked cell at once by marking whole columns revealed; a cell checks its
   *  own id and its column's. */
  const revealAll = useCallback(() => {
    setRevealed(new Set(hidden));
  }, [hidden]);

  const drillMissed = useCallback(() => {
    setRevealed(new Set());
    setMode("missed");
  }, []);

  const clearMissed = useCallback(() => {
    writeStored(missedKey, []);
    setMode("cols");
  }, [missedKey]);

  const isRevealed = useCallback(
    (cellId: string) => revealed.has(cellId) || revealed.has(cellId.slice(0, cellId.lastIndexOf("|"))),
    [revealed],
  );

  const isColumnMasked = useCallback(
    (groupId: string, column: number) => mode === "cols" && hidden.has(recallColumnId(groupId, column)),
    [hidden, mode],
  );

  const isCellMasked = useCallback(
    (groupId: string, column: number, row: number) =>
      mode === "missed" ? missed.has(recallCellId(groupId, column, row)) : hidden.has(recallColumnId(groupId, column)),
    [hidden, missed, mode],
  );

  const missedRows = useCallback(
    (groupId: string) => {
      const rows = new Set<number>();
      missed.forEach((id) => {
        if (!id.startsWith(`${groupId}|`)) return;
        const row = Number(id.slice(id.lastIndexOf("|r") + 2));
        if (Number.isFinite(row)) rows.add(row);
      });
      return rows;
    },
    [missed],
  );

  const value = useMemo<RecallValue>(
    () => ({
      groups,
      openGroups,
      isColumnMasked,
      isCellMasked,
      isRevealed,
      isMissed: (cellId: string) => missed.has(cellId),
      missedCount: missed.size,
      anyOpen: openGroups.size > 0 || mode === "missed",
      toggleGroup,
      toggleColumn,
      toggleSection,
      toggleEverything,
      reveal,
      toggleMissed,
      revealAll,
      drillMissed,
      clearMissed,
      missedRows,
    }),
    [
      groups,
      openGroups,
      mode,
      missed,
      isColumnMasked,
      isCellMasked,
      isRevealed,
      toggleGroup,
      toggleColumn,
      toggleSection,
      toggleEverything,
      reveal,
      toggleMissed,
      revealAll,
      drillMissed,
      clearMissed,
      missedRows,
    ],
  );

  return <RecallContext.Provider value={value}>{children}</RecallContext.Provider>;
}

/* ---------- controls ---------- */

/** The nav's master switch. */
export function PlaybookRecallToggle() {
  const { groups, openGroups, toggleEverything } = useRecall();
  const open = new Set(groups.filter((group) => openGroups.has(group.id)).map((group) => group.sectionId));
  const all = new Set(groups.map((group) => group.sectionId));
  const label = open.size === 0 ? "Recall" : open.size === all.size ? "Recall all" : `Recall ${open.size}`;
  return (
    <button
      type="button"
      className="playbook-recall-toggle"
      aria-pressed={open.size > 0}
      onClick={toggleEverything}
      title="Master switch — blanks every column except the one that names the row, and the diagram labels too"
    >
      {label}
    </button>
  );
}

/** The instructions and the page-wide controls, shown only once something is hidden. */
export function PlaybookRecallBar() {
  const { anyOpen, missedCount, revealAll, drillMissed, clearMissed } = useRecall();
  // Stays up while anything is flagged even with the page revealed, because otherwise the
  // only way back to a set of missed answers would be to blank a column you had finished.
  if (!anyOpen && !missedCount) return null;
  return (
    <div className="playbook-recallbar">
      <span>
        <b>Recall mode.</b> <b>Recall</b> in the nav blanks the whole page — every column except the one naming each row,
        and the diagram labels with it. A section heading, or a single table&rsquo;s own <b>Recall</b>, hides just that
        answer column, and the <b>Hide</b> chips let you pick from there. On a diagram, click a label to lift that entry.
        Click a hidden cell to check it, and mark the ones you miss — <b>Hide missed</b> then blanks only those.
      </span>
      <button type="button" onClick={revealAll}>
        Reveal all
      </button>
      <button type="button" onClick={drillMissed} disabled={!missedCount} title="Blank only the cells you marked missed">
        {missedCount ? `Hide missed (${missedCount})` : "Hide missed"}
      </button>
      <button type="button" onClick={clearMissed} disabled={!missedCount}>
        Clear missed
      </button>
    </div>
  );
}

/** The button on a section heading — switches every group in that section. */
export function PlaybookSectionRecall({ sectionId }: { sectionId: string }) {
  const { groups, openGroups, toggleSection } = useRecall();
  const mine = groups.filter((group) => group.sectionId === sectionId);
  if (!mine.length) return null;
  const on = mine.some((group) => openGroups.has(group.id));
  return (
    <button
      type="button"
      className="playbook-sec-recall"
      aria-pressed={on}
      onClick={() => toggleSection(sectionId)}
      title="Quiz this section — hides the answer column, then pick which columns to hide"
    >
      {on ? "Recall on" : "Recall"}
    </button>
  );
}

/** One group's own control strip: a Recall switch, and a chip per column once it is on. */
export function PlaybookGroupBar({ groupId, labels }: { groupId: string; labels: string[] }) {
  const { openGroups, isColumnMasked, toggleGroup, toggleColumn } = useRecall();
  const on = openGroups.has(groupId);
  return (
    <div className={on ? "playbook-colmask playbook-colmask-open" : "playbook-colmask"}>
      <span className="playbook-cmlabel">Hide</span>
      {labels.map((label, i) => (
        <button
          type="button"
          key={`${label}-${i}`}
          className="playbook-chip"
          aria-pressed={isColumnMasked(groupId, i)}
          title={`Hide "${label}" and recall it`}
          onClick={() => toggleColumn(groupId, i)}
        >
          {label}
        </button>
      ))}
      <button
        type="button"
        className="playbook-tbl-recall"
        aria-pressed={on}
        onClick={() => toggleGroup(groupId)}
        title="Quiz this one on its own"
      >
        {on ? "Recall on" : "Recall"}
      </button>
    </div>
  );
}

/** A maskable cell. Blanked, it takes a click to check; once checked it offers to record that
 *  the reader got it wrong, which is what "hide missed" later re-blanks. */
export function PlaybookMaskCell({
  groupId,
  column,
  row,
  text,
  as: Tag = "td",
  className,
  dataLabel,
  children,
}: {
  groupId: string;
  column: number;
  row: number;
  /** The source text — its length decides between a blur and a solid panel. */
  text: string;
  as?: "td" | "div";
  className?: string;
  dataLabel?: string;
  children: React.ReactNode;
}) {
  const { isCellMasked, isRevealed, isMissed, reveal, toggleMissed } = useRecall();
  const cellId = recallCellId(groupId, column, row);
  const masked = isCellMasked(groupId, column, row);
  const shown = isRevealed(cellId);
  const missed = isMissed(cellId);
  const hidden = masked && !shown;

  const classes = [
    className,
    masked ? "playbook-mask" : null,
    hidden ? "playbook-mask-on" : null,
    hidden && text.trim().length <= RECALL_SOLID_MAX_CHARS ? "playbook-mask-solid" : null,
    missed ? "playbook-missed" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes || undefined} data-label={dataLabel}>
      {hidden ? (
        <button
          type="button"
          className="playbook-maskwrap playbook-maskbtn"
          onClick={() => reveal(cellId)}
          aria-label="Hidden for recall — activate to reveal"
        >
          {children}
        </button>
      ) : (
        <span className="playbook-maskwrap">{children}</span>
      )}
      {masked && shown && (
        <button
          type="button"
          className={missed ? "playbook-missbtn playbook-missbtn-on" : "playbook-missbtn"}
          onClick={() => toggleMissed(cellId)}
        >
          {missed ? "missed — clear" : "mark missed"}
        </button>
      )}
    </Tag>
  );
}

/** Drill and case answers live in a <details>, which the browser leaves collapsed when it
 *  prints — so a printed playbook would carry the questions and none of the answers. Opens
 *  them for the print, then puts back exactly the ones it opened. */
export function PlaybookPrintDetails() {
  useEffect(() => {
    const open = () => {
      document.querySelectorAll<HTMLDetailsElement>(".playbook-drill:not([open])").forEach((el) => {
        el.open = true;
        el.dataset.reclose = "1";
      });
    };
    const close = () => {
      document.querySelectorAll<HTMLDetailsElement>(".playbook-drill[data-reclose]").forEach((el) => {
        el.open = false;
        delete el.dataset.reclose;
      });
    };
    window.addEventListener("beforeprint", open);
    window.addEventListener("afterprint", close);
    return () => {
      window.removeEventListener("beforeprint", open);
      window.removeEventListener("afterprint", close);
    };
  }, []);
  return null;
}
