import Link from "next/link";
import { NetworkIcon, ChevronRightIcon, LockIcon } from "@/components/icons";
import { slugifyTopic } from "@/lib/topic-slug";
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
 *  than anything generic. See lib/limbic-agent-insights.ts for how the two pieces
 *  (recent topics, neglected topics + their recommended articles) get computed; this
 *  component is pure presentation. "Ask Limbic Agent" links to the real /agent chat,
 *  which is isPro-gated at the page and Server Action level too (see
 *  app/(app)/agent/page.tsx, app/actions/agent.ts) — free users still get a working
 *  link, just to /pro instead. */
export function LimbicAgentCard({ insights, isPro }: { insights: LimbicAgentInsights; isPro: boolean }) {
  const hasHistory = insights.recentTopics.length > 0 || insights.neglectedTopics.length > 0;

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

          {insights.neglectedTopics.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
              <div
                style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-accent-700)" }}
              >
                Topics you haven&rsquo;t touched
              </div>
              {insights.neglectedTopics.map((n) =>
                n.recommendedArticle ? (
                  <Link
                    key={n.topic}
                    href={`/?topic=${slugifyTopic(n.topic)}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      textDecoration: "none",
                      color: "inherit",
                      fontSize: 13,
                      padding: "4px 0",
                    }}
                  >
                    <span>
                      <strong>{n.topic}</strong>
                      <span style={{ color: "var(--color-neutral-700)" }}> — {gapTrailer(n.gapDays)}</span>
                    </span>
                    <ChevronRightIcon size={14} style={{ color: "var(--color-accent-700)", flexShrink: 0 }} />
                  </Link>
                ) : (
                  <div key={n.topic} style={{ fontSize: 13, padding: "4px 0" }}>
                    <strong>{n.topic}</strong>
                    <span style={{ color: "var(--color-neutral-700)" }}> — {gapTrailer(n.gapDays)}</span>
                  </div>
                )
              )}
            </div>
          )}

          <div style={{ marginTop: 4 }}>
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
