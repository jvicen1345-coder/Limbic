import Link from "next/link";
import { decorateArticle } from "@/lib/feed";
import { ActivityIcon, CheckCircleIcon, ListIcon } from "@/components/icons";
import type { Article } from "@/lib/types";
import type { WeeklyResearchDigest } from "@/app/actions/clinician-dashboard";
import { ClinicalQuestionLogSection } from "./ClinicalQuestionLogSection";

const QUICK_TOOLS = [
  { href: "/pro/calculators", label: "Outcome Measure Calculators", icon: ActivityIcon },
  { href: "/pro/decision-rules", label: "Screening & Decision Support", icon: CheckCircleIcon },
  { href: "/pro/special-tests", label: "Special Tests", icon: ListIcon },
];

function formatDateRange(startIso: string, endIso: string): string {
  const fmt = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(startIso)} – ${fmt(endIso)}`;
}

function daysAgoLabel(dateStr: string): string {
  const days = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

/** Default-mode (no patient selected) research surface — "This Week in [Specialty]" — see
 *  getWeeklyResearchDigest. Only 3 slots; a slot with no article at all (the specialty's
 *  entire matched pool has fewer than 3 articles, not just fewer than 3 this week) shows a
 *  "more research coming this week" placeholder instead of leaving a gap. */
function WeeklyDigest({ digest }: { digest: WeeklyResearchDigest }) {
  const placeholders = Math.max(0, 3 - digest.articles.length);
  return (
    <div>
      <div className="clindash-digest-header-row">
        <div className="clindash-digest-title">This Week in {digest.specialtyLabel}</div>
        <div className="clindash-digest-subtitle">
          Updated weekly — {formatDateRange(digest.rangeStart, digest.rangeEnd)}
        </div>
      </div>
      {digest.articles.map((a) => (
        <Link key={a.id} href={`/article/${a.id}`} className="clindash-digest-item" style={{ display: "block" }}>
          <div className="clindash-digest-item-title">{a.title}</div>
          <div className="clindash-digest-item-meta">
            {a.source} · {daysAgoLabel(a.date)}
          </div>
        </Link>
      ))}
      {Array.from({ length: placeholders }, (_, i) => (
        <p className="clindash-digest-placeholder" key={i}>
          More {digest.specialtyLabel} research coming this week
        </p>
      ))}
      <Link href="/home" className="clindash-research-see-all">
        See all {digest.specialtyLabel} research
      </Link>
    </div>
  );
}

/** Right column of /pro/dashboard. Patient-mode (a patient selected) keeps the original
 *  plain article list this panel always had — see lib/dashboard-research.ts's
 *  getResearchFeedArticles for the 3-tier fallback that decides what `articles` holds
 *  there. Default mode (no patient selected) instead shows the weekly specialty digest,
 *  with the Clinical Question Log below it. */
export function ResearchFeedPanel({
  articles,
  patientLabel,
  weeklyDigest,
}: {
  articles: Article[];
  patientLabel: string | null;
  weeklyDigest: WeeklyResearchDigest;
}) {
  return (
    <div className="card elev-sm">
      <div className="card-kicker" style={{ margin: 0 }}>
        Live Research Feed
      </div>

      {patientLabel ? (
        <>
          <p className="clindash-research-sub">Matched to {patientLabel}</p>
          {articles.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)" }}>Nothing new right now.</p>
          ) : (
            <div className="clindash-research-list">
              {articles.map((a) => {
                const d = decorateArticle(a, []);
                return (
                  <Link key={a.id} href={`/article/${a.id}`} className="clindash-research-item">
                    <div className="clindash-research-item-meta">
                      {d.typeLabel} · {d.dateLabel}
                    </div>
                    <div className="clindash-research-item-title">{a.title}</div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <WeeklyDigest digest={weeklyDigest} />
      )}

      <div className="clindash-quick-tools">
        {QUICK_TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="btn btn-secondary" style={{ fontSize: 12.5, justifyContent: "flex-start" }}>
            <t.icon size={14} />
            {t.label}
          </Link>
        ))}
      </div>

      {!patientLabel && <ClinicalQuestionLogSection />}
    </div>
  );
}
