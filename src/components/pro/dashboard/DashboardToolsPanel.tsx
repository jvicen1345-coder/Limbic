import Link from "next/link";
import { ActivityIcon, CheckCircleIcon, ListIcon } from "@/components/icons";
import { ClinicalQuestionLogSection } from "./ClinicalQuestionLogSection";

const QUICK_TOOLS = [
  { href: "/pro/calculators", label: "Outcome Measure Calculators", icon: ActivityIcon },
  { href: "/pro/decision-rules", label: "Screening & Decision Support", icon: CheckCircleIcon },
  { href: "/pro/special-tests", label: "Special Tests", icon: ListIcon },
];

/** Right column of /pro/dashboard: the quick-tool links, and the Clinical Question Log
 *  beneath them.
 *
 *  This was ResearchFeedPanel, which led with a "Live Research Feed" — a per-patient article
 *  list, or a weekly specialty digest when no patient was selected. That has been removed;
 *  the tools and the question log stayed because they were only ever sharing the card with
 *  it, not part of it.
 *
 *  The question log still only appears in default mode. With a patient open the right column
 *  is about that patient, and a general "what do I want to look up later" list is a different
 *  train of thought. */
export function DashboardToolsPanel({ patientLabel }: { patientLabel: string | null }) {
  return (
    <div className="card elev-sm">
      <div className="card-kicker" style={{ margin: 0 }}>
        Quick Tools
      </div>

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
