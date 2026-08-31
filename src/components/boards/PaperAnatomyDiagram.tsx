"use client";

import { useRef, useState } from "react";

interface PaperSection {
  id: string;
  label: string;
  sublabel: string;
  readOrder: string;
  background: string;
  pill?: { text: string; tone: "critical" | "skip" };
  accentColor: string;
  whyItMatters: string;
  whatToLookFor: string[];
  clinicalTranslation: string;
}

const SECTIONS: PaperSection[] = [
  {
    id: "abstract",
    label: "Abstract",
    sublabel: "Orient here first — not for the answer",
    readOrder: "Read: 1st",
    background: "color-mix(in srgb, var(--color-accent) 15%, transparent)",
    accentColor: "var(--color-accent)",
    whyItMatters:
      "The abstract is written to be persuasive — not neutral. Authors choose what to highlight and what to minimize. Read it to understand what the study claims, then go verify whether the methods and results actually support those claims.",
    whatToLookFor: [
      "Does the conclusion match the actual results or does it overstate them",
      "What outcome measure did they use and is it clinically relevant",
      "Was this an RCT or something with lower evidence weight",
      "What population was studied — does it match your patient",
    ],
    clinicalTranslation: "The abstract tells you what the authors want you to believe. The methods tell you whether they earned it.",
  },
  {
    id: "introduction",
    label: "Introduction",
    sublabel: "What gap is this filling?",
    readOrder: "Read: 4th",
    background: "rgba(124, 58, 237, 0.10)",
    accentColor: "#7c3aed",
    whyItMatters:
      "The introduction tells you why the authors think this study was necessary. It frames the gap they are claiming to fill. Read it last — after you understand the results — to see whether the framing holds.",
    whatToLookFor: [
      "What problem are they claiming to solve",
      "What existing evidence do they acknowledge and what do they ignore",
      "Who funded this study — disclosed at the bottom of most papers",
      "Is the research question clearly stated",
    ],
    clinicalTranslation: "A well-written introduction should make you curious about the methods. If it reads like marketing, that is a signal.",
  },
  {
    id: "methods",
    label: "Methods",
    sublabel: "Where a paper is won or lost",
    readOrder: "Read: 2nd",
    background: "rgba(220, 38, 38, 0.12)",
    accentColor: "#dc2626",
    pill: { text: "Critical", tone: "critical" },
    whyItMatters:
      "The methods section is where a study is won or lost. A perfect result from a flawed method is meaningless. This is the most important section to read critically and the one most students skip.",
    whatToLookFor: [
      "Was randomization done properly and was allocation concealed",
      "Were the groups similar at baseline — check Table 1",
      "Was blinding possible and was it done",
      "What was the primary outcome measure and was it validated",
      "Was the sample size justified with a power calculation",
      "What was the dropout rate and how did they handle missing data",
    ],
    clinicalTranslation: "If the methods are weak, the results cannot be trusted regardless of the p-value.",
  },
  {
    id: "results",
    label: "Results",
    sublabel: "What they measured vs. what they claim",
    readOrder: "Read: 3rd",
    background: "rgba(201, 133, 58, 0.10)",
    accentColor: "#c9853a",
    whyItMatters:
      "Results sections show you what was actually measured. The discussion tells you what the authors think it means. Read the results independently before reading the discussion so you are not primed to accept their interpretation.",
    whatToLookFor: [
      "What was the primary outcome and what was the actual effect size",
      "Is the difference statistically significant AND clinically meaningful",
      "Check confidence intervals — a wide CI means uncertainty",
      "Look at secondary outcomes carefully — fishing for significance is common",
      "Did they report intention-to-treat or per-protocol — ITT is more conservative",
    ],
    clinicalTranslation: "An effect size of 2 points on a 100-point scale can be statistically significant with a large enough sample. Ask whether that 2 points matters to your patient.",
  },
  {
    id: "discussion",
    label: "Discussion",
    sublabel: "Often where spin begins",
    readOrder: "Read: 5th",
    background: "rgba(22, 163, 74, 0.08)",
    accentColor: "#16a34a",
    whyItMatters:
      "The discussion is where authors interpret their results and compare them to existing literature. It is also where spin is most common — emphasizing positive findings and minimizing limitations.",
    whatToLookFor: [
      "Does their interpretation match the results you just read",
      "Do they compare their results fairly to prior studies or only to studies that support their conclusion",
      "Are they extrapolating beyond what their study actually showed",
      "What do they say about clinical applicability",
    ],
    clinicalTranslation: "Read the discussion skeptically. Your job is to evaluate whether their interpretation is supported by their own data.",
  },
  {
    id: "limitations",
    label: "Limitations",
    sublabel: "The section most readers skip",
    readOrder: "Read: 5th",
    background: "var(--color-card-surface)",
    accentColor: "#c9853a",
    pill: { text: "Don't skip", tone: "skip" },
    whyItMatters:
      "The limitations section is where authors acknowledge weaknesses in their study. Most readers skip it. It is one of the most valuable sections for clinical application because it tells you when not to apply the findings.",
    whatToLookFor: [
      "Small sample size — reduces generalizability",
      "Short follow-up period — does the effect last",
      "Homogeneous population — does this apply to your patient",
      "Self-reported outcomes — subject to bias",
      "Industry funding — potential conflict of interest",
    ],
    clinicalTranslation: "A study with honest limitations is more trustworthy than one that claims no limitations. Use the limitations to decide whether this applies to your specific patient.",
  },
  {
    id: "references",
    label: "References",
    sublabel: "Check who funded it",
    readOrder: "Read: Last",
    background: "color-mix(in srgb, var(--color-card-surface) 60%, transparent)",
    accentColor: "var(--color-neutral-700)",
    whyItMatters:
      "The reference list shows you what evidence the authors built on and what they chose to ignore. Checking a few key references can reveal whether they are accurately representing prior research.",
    whatToLookFor: [
      "Are key opposing studies cited",
      "Are the references recent or is this built on outdated literature",
      "Do the in-text citations accurately represent what the cited study actually found",
      "Who funded the study — often disclosed in acknowledgments",
    ],
    clinicalTranslation: "If a study ignores well-known contradicting evidence, that is a red flag worth noting.",
  },
];

/** Replaces the old collapsed-accordion "How to Break Down a Research Article" topic (see
 *  lib/research-literacy-content.ts / components/pro/ResearchLiteracyGuide.tsx, the
 *  standalone /pro/research-literacy guide — untouched by this component, which is new and
 *  scoped only to Boards' Research & Stats tab) with a two-panel paper-anatomy diagram:
 *  seven clickable sections on the left, a detail panel on the right. Stacks on mobile,
 *  where clicking a section scrolls the detail panel into view since there's no side-by-
 *  side layout to reveal it in. */
export function PaperAnatomyDiagram() {
  const [activeId, setActiveId] = useState<string>("abstract");
  const detailRef = useRef<HTMLDivElement>(null);
  const active = SECTIONS.find((s) => s.id === activeId) ?? SECTIONS[0];

  function selectSection(id: string) {
    setActiveId(id);
    if (window.innerWidth < 860) {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div>
      <p className="paper-anatomy-reading-order">
        Typical reading order: Abstract → Methods → Results → Discussion → Introduction → Limitations
      </p>
      <div className="paper-anatomy-layout">
        <div className="paper-anatomy-diagram">
          <div className="paper-anatomy-spine" aria-hidden="true" />
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`paper-anatomy-block${s.id === activeId ? " paper-anatomy-block--active" : ""}`}
              style={{ background: s.background }}
              onClick={() => selectSection(s.id)}
              aria-pressed={s.id === activeId}
            >
              <span className="paper-anatomy-block-badge">{s.readOrder}</span>
              <span className="paper-anatomy-block-label">{s.label}</span>
              <span className="paper-anatomy-block-sublabel">{s.sublabel}</span>
              {s.pill && (
                <span className={`paper-anatomy-block-pill paper-anatomy-block-pill--${s.pill.tone}`}>{s.pill.text}</span>
              )}
            </button>
          ))}
        </div>

        <div className="paper-anatomy-detail" ref={detailRef}>
          <h3 className="paper-anatomy-detail-title" style={{ color: active.accentColor }}>
            {active.label}
          </h3>
          <div className="paper-anatomy-detail-label">Why it matters</div>
          <p className="paper-anatomy-detail-text">{active.whyItMatters}</p>
          <div className="paper-anatomy-detail-label">What to look for</div>
          <ul className="paper-anatomy-detail-list">
            {active.whatToLookFor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="paper-anatomy-detail-label">Clinical translation</div>
          <p className="paper-anatomy-detail-text">{active.clinicalTranslation}</p>
        </div>
      </div>
    </div>
  );
}
