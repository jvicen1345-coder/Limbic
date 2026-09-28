import type { Metadata } from "next";
import Link from "next/link";
import { EVIDENCE_TOPICS } from "@/lib/evidence-topics";

export const metadata: Metadata = {
  title: "Physical Therapy Evidence Library",
  description:
    "Plain-language summaries of physical therapy research, organized by condition — for clinicians, students and patients. Guidelines, systematic reviews and the newest trials, with links to free full text.",
  alternates: { canonical: "https://limbic.center/evidence" },
};

/** The public front door to Limbic's research (see app/evidence/layout.tsx). Organized by
 *  condition because that is how people arrive: "what works for my back?", not "show me
 *  RCTs from this week". */
export default function EvidenceHubPage() {
  return (
    <div className="evidence-hub">
      <section className="evidence-hero">
        <p className="evidence-kicker">Free · No account needed</p>
        <h1>Physical therapy research, made readable</h1>
        <p className="evidence-hero-lede">
          Every study here is broken down into what the researchers asked, who they studied, what they found, and what it
          means — with a version for clinicians, for students, and for patients. Tap any underlined term for a
          plain-language explanation.
        </p>
      </section>

      <section aria-labelledby="evidence-topics-heading">
        <h2 id="evidence-topics-heading" className="evidence-section-title">
          Browse by condition
        </h2>
        <ul className="evidence-topic-grid">
          {EVIDENCE_TOPICS.map((t) => (
            <li key={t.slug}>
              <Link href={`/evidence/topics/${t.slug}`} className="card evidence-topic-card">
                <span className="evidence-topic-name">{t.name}</span>
                {t.plainName !== t.name && <span className="evidence-topic-plain">{t.plainName}</span>}
                <span className="evidence-topic-blurb">{t.blurb}</span>
                {t.cpgIds.length > 0 && <span className="tag tag-evidence-cpg">Guideline available</span>}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="evidence-how" aria-labelledby="evidence-how-heading">
        <h2 id="evidence-how-heading" className="evidence-section-title">
          How to read what you find here
        </h2>
        <ol className="evidence-how-list">
          <li>
            <strong>Guidelines first.</strong> A clinical practice guideline is experts weighing all the research on a
            condition. Where one exists, it leads the page.
          </li>
          <li>
            <strong>Then reviews.</strong> Systematic reviews and meta-analyses pool many trials, so they outweigh any
            single study.
          </li>
          <li>
            <strong>Then the newest trials.</strong> Individual randomized trials are the building blocks. Check how
            many people were studied and for how long.
          </li>
          <li>
            <strong>&ldquo;Significant&rdquo; is not the same as &ldquo;meaningful.&rdquo;</strong> Where a study reports
            a known outcome measure, Limbic checks whether the difference is big enough for patients to notice.
          </li>
        </ol>
      </section>

      <section className="evidence-cta card">
        <h2>For clinicians and students</h2>
        <p>
          Sign in for a personalized research feed with a breakdown of every study you open, outcome-measure calculators,
          special tests, a home exercise program builder, and board-style practice questions linked from each study.
        </p>
        <Link href="/sign-in" className="btn btn-primary">
          Sign in or create a free account
        </Link>
      </section>
    </div>
  );
}
