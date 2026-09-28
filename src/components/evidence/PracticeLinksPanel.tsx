import Link from "next/link";
import type { PracticeLinks } from "@/lib/practice-links";

/** "Put it into practice" — links from a study to its condition page, guideline and the
 *  tools a clinician or student would reach for next (see lib/practice-links.ts). No hooks,
 *  so it renders from both server and client components. `publicView` hides the member
 *  tools behind a sign-in note instead of sending a signed-out visitor to a login wall. */
export function PracticeLinksPanel({ links, publicView = false }: { links: PracticeLinks; publicView?: boolean }) {
  return (
    <section className="evidence-practice" aria-labelledby="evidence-practice-heading">
      <h2 id="evidence-practice-heading" className="article-section-label evidence-practice-heading">
        Put it into practice
      </h2>

      <div className="evidence-practice-topics">
        {links.topics.map((t) => (
          <Link key={t.slug} href={`/evidence/topics/${t.slug}`} className="evidence-topic-chip">
            All evidence on {t.name.toLowerCase()} →
          </Link>
        ))}
      </div>

      {links.guidelines.length > 0 && (
        <ul className="evidence-practice-list">
          {links.guidelines.map((g) => (
            <li key={g.href}>
              {g.external ? (
                <a href={g.href} target="_blank" rel="noopener noreferrer" className="evidence-practice-link">
                  <span className="evidence-practice-label">{g.label}</span>
                  <span className="evidence-practice-hint">{g.hint}</span>
                </a>
              ) : (
                <Link href={g.href} className="evidence-practice-link">
                  <span className="evidence-practice-label">{g.label}</span>
                  <span className="evidence-practice-hint">{g.hint}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}

      {publicView ? (
        <p className="evidence-practice-members">
          Clinicians and students: <Link href="/sign-in">sign in</Link> for the matching outcome measures, special tests,
          home exercise program builder and practice questions.
        </p>
      ) : (
        <ul className="evidence-practice-list evidence-practice-tools">
          {links.tools.map((t) => (
            <li key={t.href}>
              <Link href={t.href} className="evidence-practice-link">
                <span className="evidence-practice-label">{t.label}</span>
                <span className="evidence-practice-hint">{t.hint}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
