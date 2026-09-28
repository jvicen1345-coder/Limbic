import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getCurrentUser } from "@/lib/session";
import { fetchPubmedById } from "@/lib/pubmed";
import { getCachedBreakdown } from "@/lib/article-breakdown-store";
import { getCachedUnpaywall } from "@/lib/unpaywall-cache";
import { getOaStatusLabel } from "@/lib/unpaywall-shared";
import { findRetraction } from "@/lib/retraction-check";
import { practiceLinksFor } from "@/lib/practice-links";
import { getStudyFeedbackSummary } from "@/lib/study-feedback";
import { EVIDENCE_LEVEL_META } from "@/lib/evidence";
import { formatDateWithYear } from "@/lib/meta";
import { EvidenceBadge } from "@/components/EvidenceBadge";
import { ArticleBreakdown } from "@/components/ArticleBreakdown";
import { RetractionBanner } from "@/components/evidence/RetractionBanner";
import { PracticeLinksPanel } from "@/components/evidence/PracticeLinksPanel";
import { StudyFeedback } from "@/components/StudyFeedback";

type Params = { params: Promise<{ id: string }> };

const PUBMED_ID_RE = /^pubmed-(\d{1,9})$/;

/** Only PubMed studies are public. Limbic Appraisals stay in the app: they carry an
 *  appraiser's provenance record (see lib/appraisal.ts) that was written for members, and
 *  guidelines and news already link straight to their publisher. */
const loadStudy = cache(async (id: string) => {
  const match = PUBMED_ID_RE.exec(id);
  if (!match) return null;
  const article = await fetchPubmedById(match[1]);
  if (!article) return null;
  const breakdown = await getCachedBreakdown(article.id);
  return { article, breakdown };
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const study = await loadStudy(id);
  if (!study) return {};
  const { article, breakdown } = study;
  return {
    title: article.title.length > 90 ? `${article.title.slice(0, 87)}…` : article.title,
    description: breakdown
      ? `${breakdown.audiences?.patient ?? breakdown.takeaway} Plain-language summary of a ${article.source} study.`
      : `Summary and free full-text links for a study published in ${article.source}.`,
    alternates: { canonical: `https://limbic.center/evidence/${article.id}` },
    // A study with no summary yet is a title and a link — thin enough that it shouldn't be
    // indexed until the warmer (or a member) has written one.
    robots: breakdown ? undefined : { index: false, follow: true },
  };
}

export default async function EvidenceStudyPage({ params }: Params) {
  const { id } = await params;
  const study = await loadStudy(id);
  if (!study) notFound();
  const { article, breakdown } = study;

  const [user, unpaywall] = await Promise.all([
    getCurrentUser(),
    article.doi ? getCachedUnpaywall(article.doi) : Promise.resolve(null),
  ]);
  const feedback = user && breakdown ? await getStudyFeedbackSummary(article.id, user.id) : null;
  const retraction = findRetraction(article);
  const links = practiceLinksFor(article, { publicView: true });
  const levelMeta = article.evidenceLevel ? EVIDENCE_LEVEL_META[article.evidenceLevel] : null;
  const freeUrl = unpaywall?.isOpenAccess ? unpaywall.bestOaLocation?.urlForPdf ?? unpaywall.bestOaLocation?.url ?? null : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: article.title,
    datePublished: article.date,
    isPartOf: { "@type": "Periodical", name: article.source },
    sameAs: article.sourceUrl,
    ...(article.doi ? { identifier: `https://doi.org/${article.doi}` } : {}),
    ...(breakdown ? { abstract: breakdown.audiences?.patient ?? breakdown.takeaway } : {}),
  };

  return (
    <article className="evidence-study-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav className="evidence-crumbs" aria-label="Breadcrumb">
        <Link href="/evidence">Evidence library</Link>
        {links?.topics[0] && (
          <>
            {" / "}
            <Link href={`/evidence/topics/${links.topics[0].slug}`}>{links.topics[0].name}</Link>
          </>
        )}
      </nav>

      <header className="evidence-study-header">
        {article.evidenceLevel && levelMeta && (
          <div className="evidence-study-level">
            <EvidenceBadge level={article.evidenceLevel} size="lg" />
            <span>{levelMeta.description}</span>
          </div>
        )}
        <h1>{article.title}</h1>
        <p className="evidence-study-source">
          {article.source} · {formatDateWithYear(article.date)}
        </p>
      </header>

      {retraction && <RetractionBanner flag={retraction} />}

      <div className="article-prose evidence-study-body">
        {breakdown ? (
          <ArticleBreakdown articleId={article.id} initial={breakdown} mode="public" defaultAudience="patient" />
        ) : (
          <div className="evidence-no-summary">
            <p>
              A plain-language summary of this study hasn&rsquo;t been written yet. Limbic writes one the first time a
              member opens the study, and works through the studies on each condition page every day.
            </p>
            {user ? (
              <Link href={`/article/${article.id}`} className="btn btn-primary">
                Open it in Limbic to generate the summary
              </Link>
            ) : (
              <Link href="/sign-in" className="btn btn-secondary">
                Sign in to generate it now
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="evidence-source-actions">
        {freeUrl && (
          <a href={freeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary evidence-free-btn">
            Read the free full text — {getOaStatusLabel(unpaywall!.oaStatus)}
          </a>
        )}
        {article.sourceUrl && (
          <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            View the original on PubMed →
          </a>
        )}
        {freeUrl && <p className="evidence-free-note">Free version located by Unpaywall — legal open access.</p>}
      </div>

      {feedback && <StudyFeedback articleId={article.id} initial={feedback} />}

      {links && <PracticeLinksPanel links={links} publicView={!user} />}
    </article>
  );
}
