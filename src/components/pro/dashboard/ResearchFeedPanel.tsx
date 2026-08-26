import Link from "next/link";
import { decorateArticle } from "@/lib/feed";
import { ActivityIcon, CheckCircleIcon, ListIcon } from "@/components/icons";
import type { Article } from "@/lib/types";

const QUICK_TOOLS = [
  { href: "/pro/calculators", label: "Outcome Measure Calculators", icon: ActivityIcon },
  { href: "/pro/decision-rules", label: "Screening & Decision Support", icon: CheckCircleIcon },
  { href: "/pro/special-tests", label: "Special Tests", icon: ListIcon },
];

/** Right column of /pro/dashboard — see lib/dashboard-research.ts for the 3-tier fallback
 *  that decides what `articles` holds: matched to the selected patient's body region and
 *  condition, matched to the clinician's own specialty, or just the most recent articles,
 *  in that order. `patientLabel` is only set once a patient is selected, purely to swap the
 *  subtitle between "specialty mode" and "patient mode" — the fetch itself already
 *  happened server-side either way. */
export function ResearchFeedPanel({ articles, patientLabel }: { articles: Article[]; patientLabel: string | null }) {
  return (
    <div className="card elev-sm">
      <div className="card-kicker" style={{ margin: 0 }}>
        Live Research Feed
      </div>
      <p className="clindash-research-sub">{patientLabel ? `Matched to ${patientLabel}` : "Matched to your specialty"}</p>

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

      <Link href="/home" className="clindash-research-see-all">
        See all research
      </Link>

      <div className="clindash-quick-tools">
        {QUICK_TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="btn btn-secondary" style={{ fontSize: 12.5, justifyContent: "flex-start" }}>
            <t.icon size={14} />
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
