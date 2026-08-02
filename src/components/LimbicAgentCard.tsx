import Link from "next/link";
import { NetworkIcon, ChevronRightIcon, LockIcon } from "@/components/icons";
import type { LimbicAgentInsights } from "@/lib/limbic-agent-insights";

/** "...reviewed Orthopedic today" / "...in 1 day" / "...in 4 days" — 0 and 1 need their
 *  own phrasing since "in today" and "in 1 days" both read wrong. */
function gapTrailer(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "in 1 day";
  return `in ${days} days`;
}

/** Home main-feed card, right under the Daily PT Dashboard — a personalized nudge back
 *  toward whatever the reader's been neglecting, built from ReadArticle history rather
 *  than anything generic. See lib/limbic-agent-insights.ts for how the three pieces
 *  (recent topics, gap topic, recommended article) get computed; this component is pure
 *  presentation. "Ask Limbic Agent" links to the real /agent chat, which is isPro-gated
 *  at the page and Server Action level too (see app/(app)/agent/page.tsx,
 *  app/actions/agent.ts) — free users still get a working link, just to /pro instead. */
export function LimbicAgentCard({ insights, isPro }: { insights: LimbicAgentInsights; isPro: boolean }) {
  const hasHistory = insights.recentTopics.length > 0 || insights.gapTopic != null;

  return (
    <div
      className="card elev-sm"
      style={{ background: "var(--color-accent-100)", border: "1px solid var(--color-accent-300)" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <NetworkIcon size={18} style={{ color: "var(--color-accent)" }} />
        <div className="card-title" style={{ fontSize: 15 }}>
          Limbic Agent
        </div>
      </div>

      {!hasHistory ? (
        <p className="card-body">Start reading to unlock your personalized insights.</p>
      ) : (
        <>
          <p className="card-body" style={{ marginBottom: 2 }}>
            Based on your reading history this week:
          </p>
          {insights.recentTopics.length > 0 ? (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {insights.recentTopics.map((t) => (
                <span key={t} className="tag tag-accent-2">
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <p className="card-body" style={{ fontSize: 12.5, opacity: 0.7 }}>
              No articles read in the past 7 days.
            </p>
          )}

          {insights.gapTopic && insights.gapDays != null && (
            <p className="card-body" style={{ fontSize: 13 }}>
              You haven&rsquo;t reviewed <strong>{insights.gapTopic}</strong> {gapTrailer(insights.gapDays)}.
            </p>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            {insights.recommendedArticle && (
              <Link href={`/article/${insights.recommendedArticle.id}`} className="btn btn-secondary" style={{ fontSize: 12.5 }}>
                Recommended Article
                <ChevronRightIcon size={14} />
              </Link>
            )}
            <Link href={isPro ? "/agent" : "/pro"} className="btn btn-primary" style={{ fontSize: 12.5 }}>
              Ask Limbic Agent
              <ChevronRightIcon size={14} />
              {!isPro && (
                <span className="tag tag-accent" style={{ background: "var(--color-bg)", display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <LockIcon size={10} />
                  PRO
                </span>
              )}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
