"use client";

import type { PlaybookBlock, PlaybookCell, PlaybookTableRow } from "@/lib/playbook-content";
import { PlaybookInline } from "@/components/playbook/PlaybookInline";
import { PlaybookChecklist } from "@/components/playbook/PlaybookChecklist";
import { PlaybookFigureBlock } from "@/components/playbook/PlaybookFigureRecall";
import { PlaybookGroupBar, PlaybookMaskCell, useRecall } from "@/components/playbook/PlaybookRecall";
import { RECALL_NUMBERS_COLUMNS } from "@/lib/playbook-recall";

function cellText(cell: PlaybookCell): string {
  return typeof cell === "string" ? cell : cell.text;
}

function cellClass(cell: PlaybookCell): string | undefined {
  if (typeof cell === "string") return undefined;
  return `playbook-cell-${cell.variant}`;
}

function isGroupRow(row: PlaybookTableRow): row is { group: string } {
  return !Array.isArray(row);
}

function PlaybookTable({ groupId, columns, rows }: { groupId: string; columns: string[]; rows: PlaybookTableRow[] }) {
  const { missedRows } = useRecall();
  const flagged = missedRows(groupId);
  return (
    <>
      <PlaybookGroupBar groupId={groupId} labels={columns} />
      <div className="playbook-tablewrap">
        <table className="playbook-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) =>
              isGroupRow(row) ? (
                <tr key={i} className="playbook-row-group">
                  <td colSpan={columns.length}>{row.group}</td>
                </tr>
              ) : (
                <tr key={i} className={flagged.has(i) ? "playbook-row-missed" : undefined}>
                  {row.map((cell, j) => (
                    <PlaybookMaskCell
                      key={j}
                      groupId={groupId}
                      column={j}
                      row={i}
                      text={cellText(cell)}
                      className={cellClass(cell)}
                      dataLabel={columns[j]}
                    >
                      <PlaybookInline text={cellText(cell)} />
                    </PlaybookMaskCell>
                  ))}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function PlaybookNumbers({ groupId, cells }: { groupId: string; cells: { value: string; label: string }[] }) {
  return (
    <>
      <PlaybookGroupBar groupId={groupId} labels={RECALL_NUMBERS_COLUMNS} />
      <div className="playbook-numgrid">
        {cells.map((cell, i) => (
          <div className="playbook-numcell" key={cell.label}>
            <PlaybookMaskCell as="div" groupId={groupId} column={0} row={i} text={cell.value} className="playbook-numcell-value">
              <PlaybookInline text={cell.value} />
            </PlaybookMaskCell>
            <PlaybookMaskCell as="div" groupId={groupId} column={1} row={i} text={cell.label} className="playbook-numcell-label">
              <PlaybookInline text={cell.label} />
            </PlaybookMaskCell>
          </div>
        ))}
      </div>
    </>
  );
}

/** One block of a playbook section. `sectionId` and `index` build the recall group id, which
 *  has to match the one lib/playbook-recall.ts derives from the same block list. */
export function PlaybookBlockView({
  block,
  slug,
  sectionId,
  index,
}: {
  block: PlaybookBlock;
  slug: string;
  sectionId: string;
  index: number;
}) {
  switch (block.kind) {
    case "heading":
      return <h3 className="playbook-h3">{block.text}</h3>;

    case "lede":
      return (
        <p className="playbook-lede">
          <PlaybookInline text={block.text} />
        </p>
      );

    case "footnote":
      return (
        <p className="playbook-footnote">
          <PlaybookInline text={block.text} />
        </p>
      );

    case "checklist":
      return <PlaybookChecklist slug={slug} items={block.items} groupId={`${sectionId}:check`} />;

    case "numbers":
      return <PlaybookNumbers groupId={`${sectionId}:g${index}`} cells={block.cells} />;

    case "table":
      return <PlaybookTable groupId={`${sectionId}:t${index}`} columns={block.columns} rows={block.rows} />;

    case "callout":
      return (
        <div className={block.tone === "warn" ? "playbook-callout playbook-callout-warn" : "playbook-callout"}>
          {block.lead && <b>{block.lead} </b>}
          <PlaybookInline text={block.body} />
        </div>
      );

    case "figure":
      return (
        <PlaybookFigureBlock
          groupId={`${sectionId}:f${index}`}
          figureId={block.figureId}
          title={block.title}
          caption={block.caption}
        />
      );

    case "cards":
      return (
        <div className="playbook-cards">
          {block.cards.map((card) => (
            <div className={`playbook-card playbook-card-${card.tone}`} key={card.title}>
              <h4>
                {card.title} <span className={`playbook-pill playbook-pill-${card.tone}`}>{card.badge}</span>
              </h4>
              <p className="playbook-card-sub">{card.subtitle}</p>
              <ul>
                {card.points.map((point) => (
                  <li key={point}>
                    <PlaybookInline text={point} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case "statkey":
      return (
        <>
          <div className="playbook-statkey">
            {block.entries.map((entry) => (
              <div className="playbook-skcell" key={entry.term}>
                <b>{entry.term}</b>
                <span>
                  <PlaybookInline text={entry.body} />
                </span>
              </div>
            ))}
          </div>
          {block.note && (
            <p className="playbook-statnote">
              <PlaybookInline text={block.note} />
            </p>
          )}
        </>
      );

    case "drill":
      return (
        <>
          {block.items.map((item) => (
            <details className="playbook-drill" key={item.question}>
              <summary>{item.question}</summary>
              <div className="playbook-drill-answer">
                <PlaybookInline text={item.answer} />
              </div>
            </details>
          ))}
        </>
      );

    case "cases":
      return (
        <>
          {block.items.map((item) => (
            <details className="playbook-drill playbook-case" key={item.scenario}>
              <summary>{item.scenario}</summary>
              <div className="playbook-drill-answer">
                {item.lines.map((line) => (
                  <p key={line.label}>
                    <b>{line.label}</b> <PlaybookInline text={line.body} />
                  </p>
                ))}
              </div>
            </details>
          ))}
        </>
      );
  }
}
