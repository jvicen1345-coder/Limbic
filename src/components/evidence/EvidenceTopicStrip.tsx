import Link from "next/link";
import { EVIDENCE_TOPICS } from "@/lib/evidence-topics";

/** Home's shortcut into the condition-organized evidence library (app/evidence). The feed
 *  below answers "what's new"; this answers "what works for…", which is the question most
 *  readers — patients especially — actually arrive with. */
export function EvidenceTopicStrip() {
  return (
    // A <section>, not a <nav>: the sidebar is the page's navigation landmark, and a second
    // one would make "the navigation" ambiguous to assistive tech (and to e2e/helpers.ts).
    <section className="evidence-strip" aria-labelledby="evidence-strip-title">
      <div className="evidence-strip-head">
        <span id="evidence-strip-title" className="evidence-strip-title">
          Evidence by condition
        </span>
        <Link href="/evidence" className="evidence-strip-all">
          See all →
        </Link>
      </div>
      <div className="evidence-strip-chips">
        {EVIDENCE_TOPICS.map((t) => (
          <Link key={t.slug} href={`/evidence/topics/${t.slug}`} className="evidence-topic-chip">
            {t.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
