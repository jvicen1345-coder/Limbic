import { ChevronRightIcon } from "@/components/icons";

/** Shared expand/collapse shell for every /pro/decision-rules card — native
 *  <details>/<summary> styled to match .card (see .pro-accordion-* in globals.css).
 *  Collapsed state shows just the one-line summary; expanded reveals the full scoring
 *  tool passed as children. */
export function RuleAccordion({ title, summary, children }: { title: string; summary: string; children: React.ReactNode }) {
  return (
    <details className="card elev-sm">
      <summary className="pro-accordion-summary">
        <div>
          <div>{title}</div>
          <div className="pro-accordion-summary-sub">{summary}</div>
        </div>
        <ChevronRightIcon size={16} className="pro-accordion-chevron" />
      </summary>
      <div className="pro-accordion-content">{children}</div>
    </details>
  );
}
