"use client";

import { Fragment, useState, useSyncExternalStore } from "react";
import { playbookChecklistRows, type PlaybookChecklistItem } from "@/lib/playbook-content";
import { PlaybookInline } from "@/components/playbook/PlaybookInline";
import { PlaybookGroupBar, PlaybookMaskCell, useRecall } from "@/components/playbook/PlaybookRecall";
import { playbookInlineText } from "@/lib/playbook-inline";
import { RECALL_CHECKLIST_COLUMNS } from "@/lib/playbook-recall";

/** The examination sequence as a check-off list with a progress bar.
 *
 *  Progress lives in localStorage rather than the database: it's a scratch pad for working
 *  through the list in a lab session, not a record anyone needs on another device, and
 *  keeping it client-side means it costs no round trip. Keyed by playbook slug so a second
 *  region gets its own state, and by item id (not index) so re-ordering the list doesn't
 *  silently re-map what a reader already ticked.
 *
 *  Read through useSyncExternalStore with a null server snapshot — same shape as
 *  components/AnatomyConnectGame.tsx — so the server and the first client render agree
 *  (nothing ticked) and the stored state arrives after hydration, with no mismatch and no
 *  setState in an effect. */

type CheckState = Record<string, boolean>;

/** Parsed once per key and frozen: useSyncExternalStore compares snapshots by identity, so
 *  re-parsing on every read would loop. Writes update this cache directly — the only writer
 *  is this component, so there is nothing else to stay in sync with. */
const cache = new Map<string, CheckState>();

function readStored(key: string): CheckState {
  const cached = cache.get(key);
  if (cached) return cached;
  let parsed: CheckState = {};
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) parsed = JSON.parse(raw) as CheckState;
  } catch {
    // Private browsing or storage disabled — the list still works, it just won't persist.
  }
  cache.set(key, parsed);
  return parsed;
}

/** Storage only changes here, in this tab, so there is nothing to subscribe to. */
const subscribeToNothing = () => () => {};

export function PlaybookChecklist({
  slug,
  items,
  groupId,
}: {
  slug: string;
  items: PlaybookChecklistItem[];
  groupId: string;
}) {
  const { missedRows } = useRecall();
  const flagged = missedRows(groupId);
  // An item with `also` rows is several lines under one tick box, and recall keys its cells
  // on the line rather than the item, so the table is rendered from the flattened list.
  const rows = playbookChecklistRows(items);
  const storageKey = `limbic-playbook-${slug}-v1`;
  const stored = useSyncExternalStore<CheckState | null>(
    subscribeToNothing,
    () => readStored(storageKey),
    () => null,
  );
  /** Ticks made in this session, layered over what was in storage at load. */
  const [changed, setChanged] = useState<CheckState>({});

  function isChecked(id: string): boolean {
    return changed[id] ?? stored?.[id] ?? false;
  }

  function toggle(id: string) {
    const next = { ...changed, [id]: !isChecked(id) };
    setChanged(next);
    const merged = { ...(stored ?? {}), ...next };
    cache.set(storageKey, merged);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(merged));
    } catch {
      // As above — a failed write shouldn't break the interaction.
    }
  }

  const done = items.filter((item) => isChecked(item.id)).length;

  return (
    <>
      <PlaybookGroupBar groupId={groupId} labels={RECALL_CHECKLIST_COLUMNS} />
      <div className="playbook-tablewrap">
        <table className="playbook-table playbook-check-table playbook-table-fixed">
          <colgroup>
            <col style={{ width: "34px" }} />
            <col style={{ width: "42px" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "40%" }} />
            <col style={{ width: "40%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>
                <span className="playbook-sr-only">Done</span>
              </th>
              <th>#</th>
              <th>Item</th>
              <th>How it&rsquo;s performed</th>
              <th>Finding / norm</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ row, item, index, first }, i) => (
              <Fragment key={`${item.id}-${i}`}>
                {/* A phase heading, printed above the first item of that phase. Not a row of
                    its own: it has no tick box and nothing to recall, so it never enters the
                    numbering that recall keys its cells on. */}
                {first && item.group && (
                  <tr className="playbook-row-group">
                    <td colSpan={5}>{item.group}</td>
                  </tr>
                )}
              <tr className={flagged.has(i) ? "playbook-row-missed" : undefined}>
                {first && (
                  <>
                    <td className="playbook-check-ck" rowSpan={1 + (item.also?.length ?? 0)}>
                      <input
                        type="checkbox"
                        checked={isChecked(item.id)}
                        onChange={() => toggle(item.id)}
                        aria-label={playbookInlineText(item.name)}
                      />
                    </td>
                    <td className="playbook-idx" rowSpan={1 + (item.also?.length ?? 0)}>
                      {index + 1}
                    </td>
                  </>
                )}
                <PlaybookMaskCell
                  groupId={groupId}
                  column={0}
                  row={i}
                  text={row.name}
                  className="playbook-cell-name"
                  dataLabel={RECALL_CHECKLIST_COLUMNS[0]}
                >
                  <PlaybookInline text={row.name} />
                </PlaybookMaskCell>
                <PlaybookMaskCell groupId={groupId} column={1} row={i} text={row.how} dataLabel={RECALL_CHECKLIST_COLUMNS[1]}>
                  <PlaybookInline text={row.how} />
                </PlaybookMaskCell>
                <PlaybookMaskCell groupId={groupId} column={2} row={i} text={row.finding} dataLabel={RECALL_CHECKLIST_COLUMNS[2]}>
                  <PlaybookInline text={row.finding} />
                </PlaybookMaskCell>
              </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="playbook-progress">
        <span>
          {done} / {items.length}
        </span>
        <span className="playbook-progress-track">
          <span className="playbook-progress-fill" style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} />
        </span>
        {flagged.size > 0 && <span className="playbook-flagcount">{flagged.size} flagged from recall</span>}
      </div>
      <p className="playbook-footnote">
        A ticked box means you can perform the item. A red stripe on a row means you missed something in it during
        recall — the two are tracked separately on purpose.
      </p>
    </>
  );
}
