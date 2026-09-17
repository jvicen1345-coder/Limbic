import type { DailyInsight } from "@/lib/daily-insight";

const LEVEL_LABEL: Record<DailyInsight["level"], string> = {
  clinician: "For a practising PT",
  student: "For a PT student",
  general: "Health & movement",
};

/**
 * The Home sidebar's daily insight — one thing worth knowing today, picked from what this
 * reader actually reads and pitched at whether they're a clinician, a student, or reading
 * as a member of the public (see lib/daily-insight.ts).
 *
 * The source link is the point of the card, not decoration: it is the article's own
 * `sourceUrl` copied from the article record, so it always opens the real publisher. The
 * model that writes the text never supplies a URL and never sees one to copy.
 */
export function DailyInsightCard({ insight }: { insight: DailyInsight }) {
  return (
    <div className="card elev-sm daily-insight-card">
      <span className="card-kicker">Daily insight</span>

      <div className="daily-insight-topic">{insight.topic}</div>
      {/* Who this was written for. Sits under the topic rather than beside the kicker: the
          sidebar is narrow enough that two labels on one line clip the longer of them. */}
      <div className="daily-insight-level">{LEVEL_LABEL[insight.level]}</div>
      <p className="daily-insight-body">{insight.insight}</p>
      <p className="daily-insight-sowhat">{insight.soWhat}</p>

      <a
        className="daily-insight-source"
        href={insight.source.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="daily-insight-source-label">Source</span>
        <span className="daily-insight-source-title">{insight.source.title}</span>
        <span className="daily-insight-source-publisher">{insight.source.publisher}</span>
      </a>
    </div>
  );
}
