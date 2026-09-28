import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EVIDENCE_TOPICS, getEvidenceTopic } from "@/lib/evidence-topics";
import { getTopicEvidence, type TopicStudy } from "@/lib/evidence-topic-feed";
import { formatDateWithYear } from "@/lib/meta";
import { OUTCOME_MEASURES } from "@/lib/outcome-measures";
import { TopicStudyRow } from "@/components/evidence/TopicStudyRow";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const topic = getEvidenceTopic(slug);
  if (!topic) return {};
  return {
    title: `${topic.name}: what the research says`,
    description: `${topic.blurb} Guidelines, systematic reviews and recent trials on ${topic.name.toLowerCase()}, summarized in plain language.`,
    alternates: { canonical: `https://limbic.center/evidence/topics/${topic.slug}` },
  };
}

/** A tally, not a synthesis: counts and facts computed from the studies on this page. A
 *  model-written "consensus" sentence would be the one place on the page with no source a
 *  reader could check, so there isn't one — the guideline is the consensus. */
function evidenceSnapshot(reviews: TopicStudy[], trials: TopicStudy[]) {
  const all = [...reviews, ...trials];
  const judged = all.filter((s) => s.meaning);
  const meaningful = judged.filter((s) => s.meaning === "likely").length;
  const summarized = all.filter((s) => s.breakdown).length;
  return { judged: judged.length, meaningful, summarized, total: all.length };
}

export default async function EvidenceTopicPage({ params }: Params) {
  const { slug } = await params;
  const topic = getEvidenceTopic(slug);
  if (!topic) notFound();

  const { guidelines, reviews, trials, latestDate } = await getTopicEvidence(topic);
  const snapshot = evidenceSnapshot(reviews, trials);
  const measures = topic.measureIds
    .map((id) => OUTCOME_MEASURES.find((m) => m.id === id))
    .filter((m): m is (typeof OUTCOME_MEASURES)[number] => !!m);
  const others = EVIDENCE_TOPICS.filter((t) => t.slug !== topic.slug).slice(0, 6);

  return (
    <article className="evidence-topic">
      <nav className="evidence-crumbs" aria-label="Breadcrumb">
        <Link href="/evidence">Evidence library</Link> / <span>{topic.name}</span>
      </nav>
      <header className="evidence-topic-header">
        <h1>{topic.name}</h1>
        {topic.plainName !== topic.name && <p className="evidence-topic-plain">Also called: {topic.plainName.toLowerCase()}</p>}
        <p className="evidence-hero-lede">{topic.blurb}</p>
      </header>

      <section className="evidence-snapshot card" aria-labelledby="snapshot-heading">
        <h2 id="snapshot-heading" className="article-breakdown-label">
          Where the evidence stands
        </h2>
        <ul>
          <li>
            {guidelines.length > 0
              ? `${guidelines.length} clinical practice guideline${guidelines.length > 1 ? "s" : ""} — start there.`
              : "No AOPT clinical practice guideline in our library yet — lean on the reviews below."}
          </li>
          <li>
            {`${reviews.length} recent ${reviews.length === 1 ? "review" : "reviews"} (systematic reviews and meta-analyses) and ${trials.length} recent randomized ${trials.length === 1 ? "trial" : "trials"} shown below.`}
          </li>
          {snapshot.judged > 0 && (
            <li>
              Of {snapshot.judged} stud{snapshot.judged === 1 ? "y" : "ies"} whose effect could be checked against a
              published MCID, {snapshot.meaningful} showed a difference patients would likely notice.
            </li>
          )}
          {latestDate && <li>Most recent publication here: {formatDateWithYear(latestDate)}.</li>}
        </ul>
        {measures.length > 0 && (
          <p className="evidence-snapshot-measures">
            Outcome measures clinicians use to track progress: {measures.map((m) => `${m.name} (${m.abbreviation})`).join(", ")}.
          </p>
        )}
      </section>

      {guidelines.length > 0 && (
        <section aria-labelledby="guidelines-heading">
          <h2 id="guidelines-heading" className="evidence-section-title">
            Clinical practice guideline
          </h2>
          <ul className="evidence-study-list">
            {guidelines.map((g) => (
              <li key={g.id} className="evidence-study">
                <div className="evidence-study-meta">
                  <span className="tag tag-evidence-cpg">CPG</span>
                  <span className="evidence-study-source">
                    {g.source} · {formatDateWithYear(g.date)}
                  </span>
                </div>
                <a href={g.sourceUrl} target="_blank" rel="noopener noreferrer" className="evidence-study-title">
                  {g.title} ↗
                </a>
                <p className="evidence-study-brief">{g.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="evidence-section-title">
          Systematic reviews and meta-analyses
        </h2>
        <p className="evidence-section-hint">Studies of studies — each pools the results of many trials.</p>
        {reviews.length > 0 ? (
          <ul className="evidence-study-list">
            {reviews.map((s) => (
              <TopicStudyRow key={s.article.id} study={s} />
            ))}
          </ul>
        ) : (
          <p className="evidence-empty">We couldn&rsquo;t load reviews from PubMed just now. Please check back soon.</p>
        )}
      </section>

      <section aria-labelledby="trials-heading">
        <h2 id="trials-heading" className="evidence-section-title">
          Recent randomized trials
        </h2>
        <p className="evidence-section-hint">Newest first. Single trials are building blocks; weigh them against the reviews.</p>
        {trials.length > 0 ? (
          <ul className="evidence-study-list">
            {trials.map((s) => (
              <TopicStudyRow key={s.article.id} study={s} />
            ))}
          </ul>
        ) : (
          <p className="evidence-empty">We couldn&rsquo;t load trials from PubMed just now. Please check back soon.</p>
        )}
      </section>

      {snapshot.total > snapshot.summarized && (
        <p className="evidence-section-hint">
          Studies without a summary yet get one the first time a Limbic member opens them, or within a few days.
        </p>
      )}

      <nav className="evidence-related-topics" aria-label="Other conditions">
        <h2 className="evidence-section-title">Other conditions</h2>
        <div className="evidence-practice-topics">
          {others.map((t) => (
            <Link key={t.slug} href={`/evidence/topics/${t.slug}`} className="evidence-topic-chip">
              {t.name}
            </Link>
          ))}
          <Link href="/evidence" className="evidence-topic-chip">
            All conditions →
          </Link>
        </div>
      </nav>
    </article>
  );
}
