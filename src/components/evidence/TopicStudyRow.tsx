import Link from "next/link";
import { EvidenceBadge } from "@/components/EvidenceBadge";
import { MEANING_LABELS } from "@/lib/clinical-meaning";
import { formatDateWithYear } from "@/lib/meta";
import type { TopicStudy } from "@/lib/evidence-topic-feed";

/** One study on a condition page: what kind of study it is, how big, what it found in a
 *  sentence, and whether that matters — enough to decide whether to open it. */
export function TopicStudyRow({ study }: { study: TopicStudy }) {
  const { article, breakdown } = study;
  const facts = [
    breakdown?.sampleSize ? `${breakdown.sampleSize.toLocaleString("en-US")} participants` : null,
    breakdown?.followUp ? `${breakdown.followUp} follow-up` : null,
  ].filter(Boolean);
  const inBrief = breakdown?.audiences?.patient ?? breakdown?.takeaway ?? null;

  return (
    <li className={`evidence-study${study.retracted ? " is-retracted" : ""}`}>
      <div className="evidence-study-meta">
        {article.evidenceLevel && <EvidenceBadge level={article.evidenceLevel} />}
        {study.retracted && <span className="article-card-retraction">Retracted or flagged</span>}
        {study.meaning && (
          <span className={`evidence-meaning-badge evidence-meaning-${study.meaning}`}>{MEANING_LABELS[study.meaning]}</span>
        )}
        <span className="evidence-study-source">
          {article.source} · {formatDateWithYear(article.date)}
        </span>
      </div>
      <Link href={`/evidence/${article.id}`} className="evidence-study-title">
        {article.title}
      </Link>
      {inBrief ? <p className="evidence-study-brief">{inBrief}</p> : null}
      {(facts.length > 0 || study.useful > 0) && (
        <p className="evidence-study-facts">
          {[...facts, study.useful > 0 ? `${study.useful} found this useful` : null].filter(Boolean).join(" · ")}
        </p>
      )}
    </li>
  );
}
