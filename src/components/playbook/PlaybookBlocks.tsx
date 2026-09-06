import type { PlaybookBlock, PlaybookCell, PlaybookTableRow } from "@/lib/playbook-content";
import { PlaybookInline } from "@/components/playbook/PlaybookInline";
import { PlaybookChecklist } from "@/components/playbook/PlaybookChecklist";
import { PlaybookFigure } from "@/components/playbook/PlaybookFigures";

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

function PlaybookTable({ columns, rows }: { columns: string[]; rows: PlaybookTableRow[] }) {
  return (
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
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className={cellClass(cell)}>
                    <PlaybookInline text={cellText(cell)} />
                  </td>
                ))}
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

/** One block of a playbook section. `slug` is only needed by the checklist, which keys its
 *  saved progress on it. */
export function PlaybookBlockView({ block, slug }: { block: PlaybookBlock; slug: string }) {
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
      return <PlaybookChecklist slug={slug} items={block.items} />;

    case "numbers":
      return (
        <div className="playbook-numgrid">
          {block.cells.map((cell) => (
            <div className="playbook-numcell" key={cell.label}>
              <div className="playbook-numcell-value">
                <PlaybookInline text={cell.value} />
              </div>
              <div className="playbook-numcell-label">
                <PlaybookInline text={cell.label} />
              </div>
            </div>
          ))}
        </div>
      );

    case "table":
      return <PlaybookTable columns={block.columns} rows={block.rows} />;

    case "callout":
      return (
        <div className={block.tone === "warn" ? "playbook-callout playbook-callout-warn" : "playbook-callout"}>
          {block.lead && <b>{block.lead} </b>}
          <PlaybookInline text={block.body} />
        </div>
      );

    case "figure":
      return (
        <figure className="playbook-figure">
          <p className="playbook-figtitle">{block.title}</p>
          <PlaybookFigure figureId={block.figureId} />
          <figcaption>
            <PlaybookInline text={block.caption} />
          </figcaption>
        </figure>
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
              <div className="playbook-skcell" key={entry.abbr}>
                <b>{entry.abbr}</b>
                <span>
                  <em>{entry.term}</em> <PlaybookInline text={entry.body} />
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
  }
}
