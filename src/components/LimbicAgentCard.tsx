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
          <div className="home-agent-week">
            <p className="card-body" style={{ marginBottom: 2 }}>
              Based on your reading history this week:
            </p>
            {insights.recentTopics.length > 0 ? (
              <div className="home-agent-tags">
                {insights.recentTopics.map((t) => (
                  <span key={t} className="tag tag-accent-2">
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="home-agent-week-empty">No articles read in the past 7 days.</p>
            )}
          </div>

          {insights.neglectedTopics.length > 0 && (
            <div className="home-agent-gaps">
              <div className="home-agent-gaps-label">Topics you haven&rsquo;t touched</div>
              {insights.neglectedTopics.map((n) =>
                n.recommendedArticle ? (
                  <Link key={n.topic} href={`/home?topic=${slugifyTopic(n.topic)}`} className="home-agent-topic">
                    <span className="home-agent-topic-label">
                      <strong>{n.topic}</strong>
                      <span className="home-agent-topic-meta">, {gapTrailer(n.gapDays)}</span>
                    </span>
                    <ChevronRightIcon size={14} className="home-agent-topic-chevron" />
                  </Link>
                ) : (
                  <div key={n.topic} className="home-agent-topic">
                    <span className="home-agent-topic-label">
                      <strong>{n.topic}</strong>
                      <span className="home-agent-topic-meta">, {gapTrailer(n.gapDays)}</span>
                    </span>
                  </div>
                )
              )}
            </div>
          )}

          <div className="home-agent-footer">
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
