"use client";

import { useState } from "react";

interface EvidenceLevel {
  id: string;
  label: string;
  badge?: string;
  background: string;
  color: string;
  italic?: boolean;
  border?: boolean;
  /** Inset from each side, as a percentage — smaller means wider. Combined with the next
   *  level's inset to draw this level's trapezoid (narrower at top, flaring to meet the
   *  level below), so the six levels stack into one continuous pyramid outline. */
  topInset: number;
  bottomInset: number;
  whatItIs: string;
  strengths: [string, string];
  limitations: [string, string];
  ptExample: string;
}

const LEVELS: EvidenceLevel[] = [
  {
    id: "sr-ma",
    label: "Systematic Reviews and Meta-Analyses",
    badge: "SR / MA",
    background: "linear-gradient(135deg, #c9853a, #f59e0b)",
    color: "#fff",
    topInset: 32,
    bottomInset: 26,
    whatItIs:
      "A systematic review synthesizes all available studies on a question using a rigorous search strategy. A meta-analysis statistically combines the results of multiple studies into a single pooled estimate.",
    strengths: ["Reduces the influence of individual study bias.", "Provides the most comprehensive view of available evidence."],
    limitations: [
      "Only as good as the studies included — garbage in garbage out.",
      "Publication bias can skew results toward positive findings.",
    ],
    ptExample: "A Cochrane systematic review of exercise therapy for chronic low back pain pooling 249 trials.",
  },
  {
    id: "rct",
    label: "Randomized Controlled Trials",
    background: "var(--color-accent)",
    color: "#fff",
    topInset: 26,
    bottomInset: 20,
    whatItIs:
      "Participants are randomly assigned to treatment or control groups. Randomization is the best tool available for controlling confounding variables.",
    strengths: ["Random allocation minimizes selection bias.", "Can establish cause and effect when done well."],
    limitations: [
      "Expensive and time-consuming.",
      "Ethical limitations prevent randomization for some questions, and efficacy in controlled conditions may not reflect real-world effectiveness.",
    ],
    ptExample: "Patients with knee OA randomized to land-based exercise versus aquatic exercise versus control — comparing KOOS scores at 12 weeks.",
  },
  {
    id: "cohort",
    label: "Cohort Studies",
    background: "#7c3aed",
    color: "#fff",
    topInset: 20,
    bottomInset: 14,
    whatItIs:
      "A group of people with a shared characteristic are followed over time to observe outcomes. No intervention is applied — researchers observe what happens naturally.",
    strengths: ["Good for studying prognosis and natural history.", "Useful when randomization is not feasible."],
    limitations: ["Cannot establish causation.", "Confounding variables are difficult to control, and long-term follow-up is expensive."],
    ptExample: "Following 500 patients after first-time ACL tear for 5 years to determine who develops knee OA.",
  },
  {
    id: "case-control",
    label: "Case-Control Studies",
    background: "rgba(124, 58, 237, 0.5)",
    color: "#fff",
    topInset: 14,
    bottomInset: 7,
    whatItIs:
      "Researchers compare people who have an outcome — cases — with people who do not — controls — and look backward to identify potential causes.",
    strengths: ["Efficient for studying rare conditions.", "Less expensive than cohort studies."],
    limitations: ["Prone to recall bias.", "Cannot prove causation, and it is difficult to select appropriate controls."],
    ptExample: "Comparing patients who developed chronic pain after whiplash — cases — with those who recovered — controls — to identify risk factors.",
  },
  {
    id: "case-reports",
    label: "Case Reports and Case Series",
    background: "var(--color-card-surface)",
    color: "var(--color-text)",
    border: true,
    topInset: 7,
    bottomInset: 0,
    whatItIs:
      "Detailed descriptions of one patient — case report — or a small group of patients — case series — with an unusual presentation or outcome.",
    strengths: ["Useful for hypothesis generation.", "Important for rare conditions with no other data, and can describe novel interventions."],
    limitations: ["No control group.", "Cannot establish causation or generalizability, and carry a high risk of bias."],
    ptExample: "A report of three patients with cervicogenic dizziness treated with manual therapy and vestibular rehabilitation — all improved.",
  },
  {
    id: "expert-opinion",
    label: "Expert Opinion and Clinical Experience",
    background: "color-mix(in srgb, var(--color-card-surface) 60%, transparent)",
    color: "var(--color-neutral-700)",
    italic: true,
    border: true,
    topInset: 0,
    bottomInset: 0,
    whatItIs:
      "The recommendations of experienced clinicians or professional bodies based on their training and practice experience rather than formal research.",
    strengths: ["Practical and immediately applicable.", "Captures clinical wisdom not yet studied in trials."],
    limitations: ["Subject to bias and personal preference.", "Does not account for individual patient variation, and can perpetuate outdated practices."],
    ptExample: "A senior PT recommending a specific manual therapy technique based on 20 years of practice — not yet studied in an RCT.",
  },
];

/** Replaces the old "The evidence hierarchy — what to weigh more heavily" accordion item
 *  (see ResearchLiteracyGuide.tsx / research-literacy-content.ts on the standalone
 *  /pro/research-literacy guide, which this doesn't touch) with a CSS-only pyramid — six
 *  stacked trapezoids built from clip-path polygons, no SVG/canvas/image. Each level's
 *  topInset/bottomInset (see LEVELS above) is wide enough at the bottom to meet the next
 *  level's top, so the six segments read as one continuous pyramid silhouette. */
export function EvidenceHierarchyPyramid() {
  const [activeId, setActiveId] = useState<string>(LEVELS[0].id);
  const active = LEVELS.find((l) => l.id === activeId) ?? LEVELS[0];

  return (
    <div className="evidence-pyramid-section">
      <h2 className="evidence-pyramid-title">Evidence Hierarchy</h2>
      <p className="evidence-pyramid-subtitle">Not all research is equal. Here is how to weigh what you read.</p>

      <div className="evidence-pyramid-row">
        <div className="evidence-pyramid">
          {LEVELS.map((level) => {
            // clip-path only affects rendering, not layout — text still wraps against the
            // button's full (unclipped) width unless explicitly constrained, which would
            // let it overflow past the visible trapezoid at the narrower levels. Cap the
            // text to the width of the trapezoid's narrower edge (the larger of the two
            // insets) so it always wraps to fit inside what's actually visible.
            const narrowerEdgeInset = Math.max(level.topInset, level.bottomInset);
            const visibleWidthPercent = 100 - 2 * narrowerEdgeInset;
            return (
              <button
                key={level.id}
                type="button"
                className={`evidence-pyramid-level${level.id === activeId ? " evidence-pyramid-level--active" : ""}${level.border ? " evidence-pyramid-level--bordered" : ""}`}
                style={{
                  background: level.background,
                  color: level.color,
                  fontStyle: level.italic ? "italic" : undefined,
                  clipPath: `polygon(${level.topInset}% 0%, ${100 - level.topInset}% 0%, ${100 - level.bottomInset}% 100%, ${level.bottomInset}% 100%)`,
                }}
                onClick={() => setActiveId(level.id)}
                aria-pressed={level.id === activeId}
              >
                <span className="evidence-pyramid-level-inner" style={{ maxWidth: `${visibleWidthPercent}%` }}>
                  {level.badge && <span className="evidence-pyramid-badge">{level.badge}</span>}
                  {level.label}
                </span>
              </button>
            );
          })}
          {/* Positioned relative to the whole pyramid stack (not the individual clipped
              level buttons, which would clip these away) — a dashed connector line running
              from each edge label in to the pyramid's outer edge. */}
          <span className="evidence-pyramid-side-label evidence-pyramid-side-label--top">Highest evidence</span>
          <span className="evidence-pyramid-side-label evidence-pyramid-side-label--bottom">Lowest evidence</span>
        </div>
      </div>

      <div className="evidence-pyramid-detail">
        <div className="evidence-pyramid-detail-title">{active.label}</div>
        <div className="evidence-pyramid-detail-label">What it is</div>
        <p className="evidence-pyramid-detail-text">{active.whatItIs}</p>
        <div className="evidence-pyramid-detail-label">Strengths</div>
        <ul className="evidence-pyramid-detail-list">
          {active.strengths.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <div className="evidence-pyramid-detail-label">Limitations</div>
        <ul className="evidence-pyramid-detail-list">
          {active.limitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <div className="evidence-pyramid-detail-label">PT example</div>
        <p className="evidence-pyramid-detail-text">{active.ptExample}</p>
      </div>

      <p className="evidence-pyramid-note">
        Evidence levels guide your confidence in findings — they do not dictate treatment. A well-conducted case
        series for a rare condition may be more useful than a poorly conducted RCT. Always apply evidence in the
        context of your patient&rsquo;s values, your clinical expertise, and the available research.
      </p>
    </div>
  );
}
